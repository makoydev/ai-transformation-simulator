/**
 * Turns board-review trust factors into concrete next steps: one or two suggestions after each
 * quarterly review, and the "why the board lost confidence" summary when the player is fired.
 */
import { SCENARIOS } from '@/data/scenarios';
import { STAKEHOLDERS, STAKEHOLDER_ORDER } from '@/data/stakeholders';
import { BALANCE } from './balance';
import { avgAdoption, productionProjects } from './selectors';
import type { GameState, QuarterReport, TrustFactorKind } from './types';

/** Trust lost outside the board review: event choices and decisions during the quarter. */
export type LossKind = TrustFactorKind | 'events';

export interface BoardTip {
  kind: LossKind;
  /** What went wrong, for the fired summary. */
  title: string;
  /** One concrete thing to do about it. */
  tip: string;
  /** Net trust change from this cause (negative for a loss). */
  delta: number;
}

const TITLES: Record<LossKind, string> = {
  honeymoon: 'Honeymoon period',
  value: 'Value fell short of the target',
  missStreak: 'Missed the target quarter after quarter',
  support: 'The executive team was skeptical',
  purgatory: 'Pilots sat in PoC purgatory',
  risk: 'Risk exposure alarmed the board',
  governance: 'Confidence in AI governance',
  overspend: 'The budget ran over',
  morale: 'Workforce unrest',
  events: 'Event and crisis choices',
};

/** The most useful next step for one cause of lost trust, given the current game. */
export function adviceFor(kind: LossKind, s: GameState): string {
  switch (kind) {
    case 'honeymoon':
      return 'No target yet, but one is coming and it rises every quarter. Get pilots running now, so you have winners to scale when it arrives.';
    case 'value': {
      const adoption = Math.round(avgAdoption(s));
      if (productionProjects(s).length === 0) {
        return 'Get a pilot into production. Process fixes and bought tools pilot in one quarter and pay back fastest.';
      }
      if (adoption < 50) {
        return `Adoption is only ${adoption}%, and value scales with it. Champions, the AI Literacy Academy and a town hall speed it up.`;
      }
      if (!s.kpiDashboard) {
        const credited = Math.round(BALANCE.unmeasuredValueFactor * 100);
        return `Fund Baselines & KPI Dashboard in Strategy: without it the board credits only about ${credited}% of your value.`;
      }
      return 'Scale more winners. The target rises every quarter, and executive hype pushes it higher.';
    }
    case 'missStreak':
      return 'Break the streak with a quick win, or run a Reset Expectations Briefing to bring the target down.';
    case 'support': {
      const lowest = STAKEHOLDER_ORDER.reduce((a, b) => (s.stakeholders[b] < s.stakeholders[a] ? b : a));
      return `${STAKEHOLDERS[lowest].name} is your least supportive executive. The People panel shows what they love and hate.`;
    }
    case 'purgatory':
      return 'Decide every pilot the quarter its results arrive: scale it, iterate it, or kill it.';
    case 'risk':
      return `Keep risk below ${BALANCE.trust.riskThreshold}: adopt governance policies in Strategy and use human-in-the-loop review on high-stakes systems.`;
    case 'governance':
      return 'Keep risk low as you scale.';
    case 'overspend':
      return 'Check the run costs due at quarter end before spending, and retire systems that cost more than they deliver.';
    case 'morale':
      return 'Fearful staff slow adoption. A town hall or the AI Literacy Academy rebuilds morale.';
    case 'events':
      return 'Some event choices cost trust. Their debriefs, collected in your Playbook, explain what would have worked.';
  }
}

const tip = (kind: LossKind, delta: number, s: GameState): BoardTip => ({ kind, title: TITLES[kind], tip: adviceFor(kind, s), delta });

/**
 * Suggestions after a board review: the biggest one or two trust losses, or the honeymoon
 * reminder when nothing was lost yet. Empty after a quarter with no losses.
 */
export function reviewTips(report: QuarterReport, s: GameState, max = 2): BoardTip[] {
  const losses = report.factors
    .filter((f): f is typeof f & { kind: TrustFactorKind } => f.kind !== undefined && f.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, max)
    .map((f) => tip(f.kind, f.delta, s));
  if (losses.length) return losses;
  const honeymoon = report.factors.find((f) => f.kind === 'honeymoon');
  return honeymoon ? [tip('honeymoon', honeymoon.delta, s)] : [];
}

/**
 * The biggest causes of lost trust over the whole game, net of gains from the same cause,
 * including trust lost to events between reviews. Empty for saves from before factors were kept.
 */
export function trustLosses(s: GameState, max = 3): BoardTip[] {
  if (!s.history.some((h) => h.factors)) return [];
  const totals = new Map<LossKind, number>();
  const add = (kind: LossKind, delta: number) => totals.set(kind, (totals.get(kind) ?? 0) + delta);
  let trustAfterLast = SCENARIOS[s.scenarioId].startTrust;
  for (const h of s.history) {
    for (const f of h.factors ?? []) if (f.kind) add(f.kind, f.delta);
    if (h.trustBefore !== undefined) add('events', h.trustBefore - trustAfterLast);
    trustAfterLast = h.trust;
  }
  return [...totals]
    .filter(([, delta]) => delta < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, max)
    .map(([kind, delta]) => tip(kind, delta, s));
}
