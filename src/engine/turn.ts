/**
 * Quarter-end simulation: pilots resolve, production systems generate value
 * and grow adoption, costs are paid, risk is assessed, and the board reviews
 * your performance against (hype-inflated) expectations.
 */
import { produce } from 'immer';
import { BOARD_QUOTES } from '@/data/quips';
import { BALANCE } from './balance';
import { buildPilotDebrief } from './debriefs';
import { addDebrief, debriefOnce, message, say, shiftStakeholder, spend } from './effects';
import { drawNextEvent } from './events';
import { pick, random } from './rng';
import {
  avgAdoption,
  clamp,
  expectedRunRate,
  fitOf,
  measuredFactor,
  pilotSuccessChance,
  productionProjects,
  projectValue,
  quarterlyCosts,
  readinessGap,
  readinessRequired,
  round,
  scenarioOf,
  stakeholderAverage,
  totalRisk,
  caseOf,
} from './selectors';
import type { GameState, PilotResult, Project, QuarterReport, TrustFactor, Verdict } from './types';

function resolvePilot(d: GameState, p: Project): void {
  const uc = caseOf(p);
  const fit = fitOf(uc, p.approach);
  const chance = pilotSuccessChance(d, uc, p.approach, p.iterations);
  const roll = random(d);
  const result: PilotResult = roll < chance ? 'success' : roll < chance + (1 - chance) * 0.55 ? 'mixed' : 'failed';

  p.stage = 'results';
  p.result = result;
  p.resultsQuarter = d.quarter;
  p.stalledQuarters = 0;
  p.quartersRemaining = 0;

  const debrief = addDebrief(
    d,
    buildPilotDebrief(
      uc,
      p.approach,
      fit,
      result,
      readinessGap(d, uc, p.approach),
      d.departments[uc.dept].dataReadiness,
      readinessRequired(uc, p.approach),
    ),
  );
  p.debriefId = debrief.id;
  say(d, result === 'failed' ? 'results_failed' : 'results_success');
}

function growAdoption(d: GameState, p: Project): void {
  const a = BALANCE.adoption;
  const dept = d.departments[caseOf(p).dept];
  let growth = a.base + d.literacy * a.perLiteracy + (d.morale - 50) / 6;
  if (dept.champions) growth += a.champions;
  if (p.approach === 'process') growth += a.processBonus;
  if (p.approach === 'buy' && d.policies.includes('catalog')) growth += a.catalogBuyBonus;
  if (p.hitl) growth += BALANCE.hitlAdoptionBonus;
  p.adoption = round(clamp(p.adoption + growth, a.min, a.max), 1);
}

function verdictFor(delta: number): Verdict {
  if (delta >= 5) return 'great';
  if (delta >= 1) return 'good';
  if (delta >= -3) return 'mixed';
  return 'bad';
}

function headlineFor(verdict: Verdict, outcome: QuarterReport['outcome']): string {
  if (outcome === 'fired') return 'The board has decided to "go in a different direction"';
  if (outcome === 'completed') return 'Final board review: the two-year transformation is complete';
  switch (verdict) {
    case 'great':
      return 'AI program ahead of plan';
    case 'good':
      return 'Steady progress, cautious optimism';
    case 'mixed':
      return 'The board wants to see results';
    case 'bad':
      return 'Board confidence is slipping';
  }
}

export function endQuarter(state: GameState): GameState {
  if (state.phase !== 'planning') return state;

  return produce(state, (d) => {
    const q = d.quarter;
    const sc = scenarioOf(d);
    const trustBefore = d.trust;
    const completedPilots: string[] = [];

    // 1. Pilots that already had results and sat a whole quarter without a decision.
    for (const p of d.projects) {
      if (p.stage === 'results' && p.resultsQuarter !== null && p.resultsQuarter < q) {
        p.stalledQuarters += 1;
        d.stats.purgatoryQuarters += 1;
      }
    }

    // 2. Pilots progress and may resolve.
    for (const p of d.projects) {
      if (p.stage !== 'pilot') continue;
      p.quartersRemaining -= 1;
      if (p.quartersRemaining <= 0) {
        resolvePilot(d, p);
        completedPilots.push(p.id);
      }
    }

    // 3. Production systems deliver value, then adoption grows.
    let value = 0;
    for (const p of productionProjects(d)) {
      const v = projectValue(p);
      p.valueRealized = round(p.valueRealized + v);
      value += v;
      growAdoption(d, p);
    }
    value = round(value);
    d.cumulativeValue = round(d.cumulativeValue + value);

    // 4. Recurring costs.
    const costs = quarterlyCosts(d).total;
    spend(d, costs);

    // 5. Workforce sentiment.
    for (const p of productionProjects(d)) {
      const dept = d.departments[caseOf(p).dept];
      if (['agentic', 'finetune'].includes(p.approach) && !dept.champions && d.literacy < 2) d.morale -= 1.5;
    }
    if (d.literacy >= 1 && productionProjects(d).length > 0) d.morale += 1;
    d.morale = clamp(Math.round(d.morale + (50 - d.morale) * 0.05));

    // 6. Shadow AI grows when people lack sanctioned tools.
    if (!d.policies.includes('catalog')) {
      const drift = d.policies.includes('aup') ? BALANCE.risk.shadowDriftWithAup : BALANCE.risk.shadowDrift;
      const extra = d.flags.shadowBan ? 1 : 0;
      d.riskBase = round(Math.min(BALANCE.risk.shadowDriftCap, d.riskBase + drift + extra), 2);
    }

    // 7. Stakeholder drift.
    if (q >= 2) {
      if (value > costs) shiftStakeholder(d, 'cfo', 2);
      else if (q >= 3 && costs > value * 2) shiftStakeholder(d, 'cfo', -2);
    }
    if (q >= 3 && productionProjects(d).length === 0) shiftStakeholder(d, 'ceo', -4);

    // 8. Board review.
    const T = BALANCE.trust;
    const risk = totalRisk(d);
    d.stats.peakRisk = Math.max(d.stats.peakRisk, Math.round(risk));
    const expected = expectedRunRate(d, q);
    const perceived = round(value * measuredFactor(d));
    const factors: TrustFactor[] = [];

    if (expected < 0.05) {
      factors.push({ kind: 'honeymoon', label: 'Honeymoon period', delta: T.honeymoon });
    } else {
      const weight = Math.min(1, 0.4 + q * 0.15);
      const ratio = perceived / expected;
      const delta = Math.round(clamp((ratio - 1) * T.valueSwing * weight, T.maxLoss, T.maxGain));
      const label =
        ratio >= 1
          ? `Value beat expectations (${Math.round(ratio * 100)}% of target)`
          : `Value below expectations (${Math.round(ratio * 100)}% of target)`;
      factors.push({ kind: 'value', label, delta });

      // Boards forgive one bad quarter, not a pattern.
      const streak = ratio < T.missRatio ? Number(d.flags.missStreak ?? 0) + 1 : 0;
      d.flags.missStreak = streak;
      if (streak >= 2) {
        factors.push({ kind: 'missStreak', label: `Board patience wearing thin (${streak} quarters off target)`, delta: -(streak - 1) * T.missStreakPenalty });
      }
    }

    const support = Math.round((stakeholderAverage(d) - 50) / T.supportDivisor);
    if (support !== 0) {
      factors.push({ kind: 'support', label: support > 0 ? 'Executive team backs you' : 'Executive team is skeptical', delta: support });
    }

    const stalled = d.projects.filter((p) => p.stage === 'results' && p.stalledQuarters >= 1);
    d.stats.maxPurgatory = Math.max(d.stats.maxPurgatory, stalled.length);
    if (stalled.length) {
      factors.push({
        kind: 'purgatory',
        label: `PoC purgatory (${stalled.length} undecided pilot${stalled.length > 1 ? 's' : ''})`,
        delta: -Math.min(T.purgatoryCap, stalled.length * T.purgatoryPenalty),
      });
      shiftStakeholder(d, 'cfo', -2);
      say(d, 'purgatory');
      debriefOnce(d, {
        kind: 'decision',
        verdict: 'bad',
        title: 'Welcome to PoC purgatory',
        summary: 'Pilots finished, but you made no scale, iterate, or kill decision.',
        insight:
          'A pilot without a production decision is a cost without a return. Every quarter it sits there, the board loses confidence. Decide: scale it, iterate with a clear hypothesis, or kill it.',
        realWorld:
          'A widely cited 2025 MIT NANDA report ("The GenAI Divide") estimated that around 95% of enterprise generative AI pilots were delivering no measurable P&L impact, with most never making it into production.',
        lessonId: 'poc-purgatory',
      });
    }

    if (risk > T.riskThreshold) {
      factors.push({ kind: 'risk', label: 'Board alarmed by AI risk exposure', delta: -Math.round((risk - T.riskThreshold) / 5) });
    } else if (risk < 25 && productionProjects(d).length >= 2) {
      factors.push({ kind: 'governance', label: 'Confidence in AI governance', delta: 1 });
    }

    if (d.budget < 0) {
      factors.push({ kind: 'overspend', label: 'Budget overrun', delta: -T.overspendPenalty });
      say(d, 'low_budget');
    }
    if (d.morale < T.lowMoraleThreshold) factors.push({ kind: 'morale', label: 'Workforce unrest', delta: -3 });

    const trustDelta = factors.reduce((sum, f) => sum + f.delta, 0);
    d.trust = clamp(Math.round(d.trust + trustDelta));

    // 9. Outcome.
    let outcome: QuarterReport['outcome'] = 'continue';
    if (d.trust < BALANCE.fireThreshold) outcome = 'fired';
    else if (q >= d.maxQuarters) outcome = 'completed';

    // 10. Budget allocation for next quarter and hype normalization.
    let allocation = 0;
    if (outcome === 'continue') {
      allocation = round(sc.allocation * (0.5 + d.trust / 100), 2);
      d.budget = round(d.budget + allocation);
      d.hype = round(d.hype + (1 - d.hype) * 0.1, 2);
    }

    const verdict = verdictFor(trustDelta);
    d.history.push({
      quarter: q,
      budget: round(d.budget, 2),
      runRate: value,
      expected,
      adoption: Math.round(avgAdoption(d)),
      risk: Math.round(risk),
      trust: d.trust,
      morale: d.morale,
      cumulativeValue: d.cumulativeValue,
      cumulativeSpend: d.cumulativeSpend,
      trustBefore,
      factors,
    });

    d.lastReport = {
      quarter: q,
      valueThisQuarter: value,
      perceivedValue: perceived,
      measured: d.kpiDashboard,
      expected,
      runCosts: costs,
      allocation,
      trustBefore,
      trustAfter: d.trust,
      factors,
      completedPilots,
      risk: Math.round(risk),
      adoption: Math.round(avgAdoption(d)),
      verdict,
      headline: headlineFor(verdict, outcome),
      boardQuote: pick(d, BOARD_QUOTES[outcome === 'fired' ? 'bad' : verdict]),
      outcome,
    };

    if (outcome === 'continue') {
      if (d.trust < BALANCE.warningThreshold) {
        message(d, 'ceo', 'The board is losing patience. I need a win next quarter, or I can\'t protect you.', 'negative');
      }
      const eventId = drawNextEvent(d);
      if (eventId) d.pendingEvents.push(eventId);
    } else {
      d.outcome = outcome;
    }

    d.phase = 'report';
  });
}

/** Moves from the board report into the next quarter (or ends the game). */
export function beginNextQuarter(state: GameState): GameState {
  if (state.phase !== 'report') return state;
  return produce(state, (d) => {
    if (d.outcome) {
      d.phase = 'ended';
      return;
    }
    d.quarter += 1;
    d.capacityUsed = 0;
    d.capacityBonus = Number(d.flags.nextCapacityBonus ?? 0);
    delete d.flags.nextCapacityBonus;
    const hires = Number(d.flags.pendingHires ?? 0);
    if (hires > 0) {
      d.hires += hires;
      delete d.flags.pendingHires;
    }
    d.phase = d.pendingEvents.length ? 'event' : 'planning';
  });
}
