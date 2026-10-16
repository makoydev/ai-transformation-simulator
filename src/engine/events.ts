import { produce } from 'immer';
import { EVENT_MAP, EVENTS, type EventDef } from '@/data/events';
import { BALANCE } from './balance';
import { addDebrief } from './effects';
import { random, weightedPick } from './rng';
import { clamp, totalRisk } from './selectors';
import type { Debrief, GameState } from './types';

function isEligible(s: GameState, e: EventDef, nextQuarter: number): boolean {
  if (e.id === 'kickoff') return false;
  if (s.seenEvents.includes(e.id)) return false;
  if ((e.minQuarter ?? 1) > nextQuarter) return false;
  return e.condition ? e.condition(s) : true;
}

/**
 * Picks the event that will greet the player next quarter. Follow-ups jump
 * the queue; otherwise risk exposure determines the chance of an incident.
 * Mutates the RNG state on the draft.
 */
export function drawNextEvent(d: GameState): string | null {
  const nextQuarter = d.quarter + 1;
  const eligible = EVENTS.filter((e) => isEligible(d, e, nextQuarter));

  const followUp = eligible.find((e) => e.followUp);
  if (followUp) return followUp.id;

  const risk = totalRisk(d);
  const incidentChance = clamp((risk - BALANCE.incident.riskFloor) / 100, 0, BALANCE.incident.maxChance);
  const incidents = eligible.filter((e) => e.category === 'incident');
  if (incidents.length && random(d) < incidentChance) {
    const incident = weightedPick(d, incidents.map((e) => ({ item: e, weight: e.weight?.(d) ?? 2 })));
    if (incident) {
      d.stats.incidents += 1;
      return incident.id;
    }
  }

  const regular = eligible.filter((e) => e.category !== 'incident' && !e.followUp);
  const pickEvent = weightedPick(d, regular.map((e) => ({ item: e, weight: e.weight?.(d) ?? 2 })));
  return pickEvent?.id ?? null;
}

export function currentEvent(s: GameState): EventDef | null {
  const id = s.pendingEvents[0];
  return id ? (EVENT_MAP[id] ?? null) : null;
}

export function isChoiceAvailable(s: GameState, eventId: string, choiceId: string): boolean {
  const choice = EVENT_MAP[eventId]?.choices.find((c) => c.id === choiceId);
  if (!choice) return false;
  return choice.available ? choice.available(s) : true;
}

export function resolveEvent(state: GameState, choiceId: string): { state: GameState; debrief: Debrief | null } {
  if (state.phase !== 'event') return { state, debrief: null };
  const def = currentEvent(state);
  if (!def || !isChoiceAvailable(state, def.id, choiceId)) return { state, debrief: null };
  const choice = def.choices.find((c) => c.id === choiceId)!;

  const next = produce(state, (d) => {
    const spec = choice.resolve(d);
    addDebrief(d, {
      kind: 'event',
      verdict: spec.verdict,
      title: spec.title,
      summary: `${def.title}: you chose "${choice.label}".`,
      insight: spec.insight,
      realWorld: spec.realWorld,
      lessonId: spec.lessonId,
    });
    if (spec.verdict === 'great') d.stats.eventsGreat += 1;
    if (spec.verdict === 'bad') d.stats.eventsBad += 1;
    d.pendingEvents.shift();
    if (!d.seenEvents.includes(def.id)) d.seenEvents.push(def.id);
    if (d.pendingEvents.length === 0) d.phase = 'planning';
  });

  return { state: next, debrief: next.debriefs[next.debriefs.length - 1] ?? null };
}
