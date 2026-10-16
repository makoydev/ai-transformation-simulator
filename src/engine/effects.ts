/**
 * Mutation helpers used inside Immer drafts by actions, turn processing and
 * events. Centralizing them keeps clamping, spend tracking and stakeholder
 * logging consistent everywhere.
 */
import { QUIPS, type QuipTrigger } from '@/data/quips';
import { POLICIES } from '@/data/policies';
import { pick } from './rng';
import { clamp, round } from './selectors';
import type { Debrief, GameState, PolicyId, Project, StakeholderId, Tone } from './types';

export interface Effects {
  /** Negative values are spending and count toward cumulative spend. */
  budget?: number;
  trust?: number;
  morale?: number;
  hype?: number;
  riskBase?: number;
  stakeholders?: Partial<Record<StakeholderId, number>>;
  flags?: Record<string, number | boolean>;
}

export function nid(d: GameState, prefix: string): string {
  d.nextId += 1;
  return `${prefix}-${d.nextId}`;
}

export function spend(d: GameState, amount: number): void {
  if (amount <= 0) return;
  d.budget = round(d.budget - amount);
  d.cumulativeSpend = round(d.cumulativeSpend + amount);
}

export function credit(d: GameState, amount: number): void {
  if (amount <= 0) return;
  d.budget = round(d.budget + amount);
}

export function shiftStakeholder(d: GameState, id: StakeholderId, delta: number): void {
  d.stakeholders[id] = clamp(Math.round(d.stakeholders[id] + delta));
}

export function applyEffects(d: GameState, e: Effects): void {
  if (e.budget !== undefined) {
    if (e.budget < 0) spend(d, -e.budget);
    else credit(d, e.budget);
  }
  if (e.trust !== undefined) d.trust = clamp(Math.round(d.trust + e.trust));
  if (e.morale !== undefined) d.morale = clamp(Math.round(d.morale + e.morale));
  if (e.hype !== undefined) d.hype = round(clamp(d.hype + e.hype, 0.7, 2), 2);
  if (e.riskBase !== undefined) d.riskBase = round(clamp(d.riskBase + e.riskBase, 0, 80), 2);
  if (e.stakeholders) {
    for (const [id, delta] of Object.entries(e.stakeholders) as [StakeholderId, number][]) {
      shiftStakeholder(d, id, delta);
    }
  }
  if (e.flags) Object.assign(d.flags, e.flags);
}

export function message(d: GameState, stakeholder: StakeholderId, text: string, tone: Tone): void {
  d.inbox.push({ id: nid(d, 'msg'), quarter: d.quarter, stakeholder, text, tone });
  if (d.inbox.length > 60) d.inbox.splice(0, d.inbox.length - 60);
}

/** A stakeholder reacts to something you did. */
export function say(d: GameState, trigger: QuipTrigger): void {
  const reactions = QUIPS[trigger];
  if (!reactions?.length) return;
  const reaction = pick(d, reactions);
  message(d, reaction.who, pick(d, reaction.lines), reaction.tone);
}

export function unlockLesson(d: GameState, lessonId: string | undefined): void {
  if (lessonId && !d.lessons.includes(lessonId)) d.lessons.push(lessonId);
}

export function addDebrief(d: GameState, input: Omit<Debrief, 'id' | 'quarter'>): Debrief {
  const debrief: Debrief = { ...input, id: nid(d, 'debrief'), quarter: d.quarter };
  d.debriefs.push(debrief);
  unlockLesson(d, input.lessonId);
  return debrief;
}

/** Decision debriefs only appear the first time you learn a lesson, to avoid spam. */
export function debriefOnce(d: GameState, input: Omit<Debrief, 'id' | 'quarter'>): Debrief | null {
  if (input.lessonId && d.lessons.includes(input.lessonId)) return null;
  return addDebrief(d, input);
}

export function adoptPolicy(d: GameState, id: PolicyId): void {
  if (d.policies.includes(id)) return;
  const def = POLICIES[id];
  d.policies.push(id);
  applyEffects(d, { riskBase: def.riskBase, morale: def.morale, stakeholders: def.stakeholders });
}

export function endProject(d: GameState, p: Project, stage: 'killed' | 'retired'): void {
  p.stage = stage;
  p.endedQuarter = d.quarter;
  p.quartersRemaining = 0;
}
