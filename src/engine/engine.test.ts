import { describe, expect, it } from 'vitest';
import { USE_CASE_MAP } from '@/data/useCases';
import { applyAction, getActionCost, validateAction } from './actions';
import { BALANCE } from './balance';
import { diffStates } from './diff';
import { resolveEvent } from './events';
import { nextRng } from './rng';
import { computeFinalScore, determineArchetype, gradeFor } from './scoring';
import {
  capacityLeft,
  expectedRunRate,
  fitOf,
  pilotSuccessChance,
  projectRisk,
  totalRisk,
} from './selectors';
import { createInitialState } from './state';
import { beginNextQuarter, endQuarter } from './turn';
import type { GameState } from './types';

/** A fresh game, past the kickoff event, in the planning phase. */
function planningState(seed = 42): GameState {
  const s = createInitialState('pemberton', 'Test', seed);
  return resolveEvent(s, 'portfolio').state;
}

/** Ends the quarter and starts the next one, resolving any event with its first available choice. */
function nextQuarter(s: GameState): GameState {
  let next = beginNextQuarter(endQuarter(s));
  while (next.phase === 'event') next = resolveEvent(next, firstChoice(next)).state;
  return next;
}

function firstChoice(s: GameState): string {
  // Prefer choices without preconditions so tests stay deterministic.
  return ['portfolio', 'decline', 'pushback', 'bakeoff', 'townhall', 'amnesty', 'counter', 'redirect', 'celebrate',
    'incremental', 'accept', 'scoped', 'evalfirst', 'present', 'enable', 'owners', 'finops', 'renegotiate',
    'handoff', 'lockdown', 'audit', 'honor', 'scramble', 'exit']
    .find((id) => resolveEvent(s, id).debrief !== null)!;
}

describe('rng', () => {
  it('is deterministic for a given seed', () => {
    const a = nextRng(123);
    const b = nextRng(123);
    expect(a).toEqual(b);
    expect(a.value).toBeGreaterThanOrEqual(0);
    expect(a.value).toBeLessThan(1);
  });
});

describe('initial state', () => {
  it('starts in Q1 with the kickoff event pending', () => {
    const s = createInitialState('pemberton', 'Ada', 1);
    expect(s.quarter).toBe(1);
    expect(s.phase).toBe('event');
    expect(s.pendingEvents).toEqual(['kickoff']);
    expect(s.playerName).toBe('Ada');
  });

  it('kickoff resolution moves to planning and records a debrief + lesson', () => {
    const s = planningState();
    expect(s.phase).toBe('planning');
    expect(s.debriefs).toHaveLength(1);
    expect(s.lessons).toContain('portfolio');
  });

  it('the listening-tour kickoff grants an extra capacity point this quarter', () => {
    const s = resolveEvent(createInitialState('pemberton', '', 1), 'listen').state;
    expect(capacityLeft(s)).toBe(BALANCE.baseCapacity + 1);
  });
});

describe('actions', () => {
  it('auditing spends capacity and budget and reveals the department', () => {
    const s = planningState();
    const next = applyAction(s, { type: 'audit', dept: 'finance' });
    expect(next.departments.finance.audited).toBe(true);
    expect(next.capacityUsed).toBe(1);
    expect(next.budget).toBeCloseTo(s.budget - BALANCE.auditCost);
    expect(next.cumulativeSpend).toBeCloseTo(BALANCE.auditCost);
  });

  it('cannot launch a pilot in an unaudited department', () => {
    const s = planningState();
    expect(validateAction(s, { type: 'launchPilot', useCaseId: 'finance-approvals', approach: 'process' })).toMatch(/Audit/);
  });

  it('blocks actions once capacity is exhausted', () => {
    let s = planningState();
    s = applyAction(s, { type: 'audit', dept: 'finance' });
    s = applyAction(s, { type: 'audit', dept: 'support' });
    s = applyAction(s, { type: 'audit', dept: 'hr' });
    expect(capacityLeft(s)).toBe(0);
    expect(validateAction(s, { type: 'audit', dept: 'legal' })).toMatch(/capacity/);
    // Invalid actions are no-ops.
    expect(applyAction(s, { type: 'audit', dept: 'legal' })).toBe(s);
  });

  it('only one active project per use case', () => {
    let s = planningState();
    s = applyAction(s, { type: 'audit', dept: 'finance' });
    s = applyAction(s, { type: 'launchPilot', useCaseId: 'finance-approvals', approach: 'process' });
    expect(validateAction(s, { type: 'launchPilot', useCaseId: 'finance-approvals', approach: 'buy' })).toMatch(/already/);
  });

  it('pilot cost scales with use case size', () => {
    const s = planningState();
    const cost = getActionCost(s, { type: 'launchPilot', useCaseId: 'eng-legacy', approach: 'agentic' });
    expect(cost.budget).toBeCloseTo(0.95 * USE_CASE_MAP['eng-legacy'].scale, 2);
  });
});

describe('pilot lifecycle', () => {
  it('a 1-quarter pilot produces results at quarter end with a debrief', () => {
    let s = planningState();
    s = applyAction(s, { type: 'audit', dept: 'finance' });
    s = applyAction(s, { type: 'launchPilot', useCaseId: 'finance-approvals', approach: 'process' });
    const after = endQuarter(s);
    const p = after.projects[0];
    expect(p.stage).toBe('results');
    expect(p.result).not.toBeNull();
    expect(p.debriefId).not.toBeNull();
    expect(after.lastReport?.completedPilots).toContain(p.id);
  });

  it('undecided results fall into PoC purgatory and cost trust', () => {
    let s = planningState(7);
    s = applyAction(s, { type: 'audit', dept: 'finance' });
    s = applyAction(s, { type: 'launchPilot', useCaseId: 'finance-approvals', approach: 'process' });
    s = nextQuarter(s); // results arrive at end of Q1
    expect(s.projects[0].stage).toBe('results');
    const report = endQuarter(s).lastReport!; // sat through Q2 undecided
    expect(report.factors.some((f) => f.label.startsWith('PoC purgatory'))).toBe(true);
  });

  it('scaling puts a project into production and it generates value', () => {
    let s = planningState(3);
    s = applyAction(s, { type: 'audit', dept: 'finance' });
    s = applyAction(s, { type: 'launchPilot', useCaseId: 'finance-approvals', approach: 'process' });
    s = nextQuarter(s);
    const p = s.projects[0];
    if (p.result === 'failed') return; // extremely unlikely for an ideal process fix
    s = applyAction(s, { type: 'scale', projectId: p.id, hitl: false });
    expect(s.projects[0].stage).toBe('production');
    const after = endQuarter(s);
    expect(after.lastReport!.valueThisQuarter).toBeGreaterThan(0);
    expect(after.projects[0].adoption).toBeGreaterThan(s.projects[0].adoption);
  });

  it('killing a pilot mid-flight refunds part of its cost', () => {
    let s = planningState();
    s = applyAction(s, { type: 'audit', dept: 'operations' });
    s = applyAction(s, { type: 'launchPilot', useCaseId: 'ops-demand', approach: 'finetune' });
    const before = s.budget;
    s = applyAction(s, { type: 'kill', projectId: s.projects[0].id });
    expect(s.projects[0].stage).toBe('killed');
    expect(s.budget).toBeGreaterThan(before);
    expect(s.stats.killedSmart).toBe(1);
  });

  it('HITL reduces project risk', () => {
    let s = planningState();
    s = applyAction(s, { type: 'audit', dept: 'support' });
    s = applyAction(s, { type: 'launchPilot', useCaseId: 'support-tier1-agent', approach: 'agentic' });
    const p = { ...s.projects[0], stage: 'production' as const };
    const withHitl = projectRisk(s, { ...p, hitl: true });
    const without = projectRisk(s, { ...p, hitl: false });
    expect(withHitl).toBeLessThan(without);
  });
});

describe('selectors', () => {
  it('classifies approach fit', () => {
    const uc = USE_CASE_MAP['finance-approvals'];
    expect(fitOf(uc, 'process')).toBe('ideal');
    expect(fitOf(uc, 'agentic')).toBe('poor');
    expect(fitOf(USE_CASE_MAP['sales-proposals'], 'finetune')).toBe('acceptable');
  });

  it('data readiness gaps reduce pilot success odds', () => {
    const s = planningState();
    const uc = USE_CASE_MAP['ops-field-tech']; // requires high readiness for RAG
    const low = pilotSuccessChance(s, uc, 'rag', 0);
    const ready = { ...s, departments: { ...s.departments, operations: { ...s.departments.operations, dataReadiness: 95 } } };
    expect(pilotSuccessChance(ready, uc, 'rag', 0)).toBeGreaterThan(low);
  });

  it('hype inflates board expectations', () => {
    const s = planningState();
    const hyped = { ...s, hype: 1.5 };
    expect(expectedRunRate(hyped, 4)).toBeGreaterThan(expectedRunRate(s, 4));
  });

  it('governance policies lower risk', () => {
    const s = planningState();
    const withPolicy = applyAction(s, { type: 'policy', policy: 'aup' });
    expect(totalRisk(withPolicy)).toBeLessThan(totalRisk(s));
  });
});

describe('quarter flow', () => {
  it('runs through report → next quarter', () => {
    const s = planningState();
    const report = endQuarter(s);
    expect(report.phase).toBe('report');
    expect(report.history).toHaveLength(1);
    const q2 = beginNextQuarter(report);
    expect(q2.quarter).toBe(2);
    expect(q2.capacityUsed).toBe(0);
  });

  it('hires add capacity starting next quarter', () => {
    let s = planningState();
    s = applyAction(s, { type: 'initiative', initiative: 'hire' });
    expect(capacityLeft(s)).toBe(BALANCE.baseCapacity - 1);
    s = nextQuarter(s);
    expect(s.hires).toBe(1);
    expect(capacityLeft(s)).toBe(BALANCE.baseCapacity + 1);
  });

  it('is deterministic: same seed and same moves give the same game', () => {
    const play = () => {
      let s = planningState(99);
      s = applyAction(s, { type: 'audit', dept: 'support' });
      s = applyAction(s, { type: 'launchPilot', useCaseId: 'support-kb-search', approach: 'rag' });
      for (let i = 0; i < 3; i++) s = nextQuarter(s);
      return s;
    };
    expect(play()).toEqual(play());
  });

  it('fires the player when board trust collapses', () => {
    const s = { ...planningState(), trust: 16, quarter: 4 };
    const after = endQuarter(s);
    expect(after.outcome).toBe('fired');
    expect(after.lastReport?.outcome).toBe('fired');
    expect(beginNextQuarter(after).phase).toBe('ended');
  });

  it('coasting on a single early win eventually gets you fired', () => {
    let s = planningState(11);
    s = applyAction(s, { type: 'audit', dept: 'finance' });
    s = applyAction(s, { type: 'launchPilot', useCaseId: 'finance-approvals', approach: 'process' });
    s = nextQuarter(s);
    const p = s.projects[0];
    if (p.result !== 'failed') s = applyAction(s, { type: 'scale', projectId: p.id, hitl: false });
    while (s.phase !== 'ended' && s.phase !== 'report') {
      s = endQuarter(s);
      if (s.outcome) break;
      s = beginNextQuarter(s);
      while (s.phase === 'event') s = resolveEvent(s, firstChoice(s)).state;
    }
    expect(s.outcome).toBe('fired');
    expect(s.lastReport?.factors.some((f) => f.label.startsWith('Board patience'))).toBe(true);
  });

  it('completes the game after the final quarter', () => {
    const s = { ...planningState(), trust: 80, quarter: BALANCE.maxQuarters };
    const after = endQuarter(s);
    expect(after.outcome).toBe('completed');
  });
});

describe('events', () => {
  it('rejects unavailable choices', () => {
    const s = createInitialState('pemberton', '', 5);
    expect(resolveEvent(s, 'nope').debrief).toBeNull();
  });
});

describe('scoring', () => {
  it('maps totals to grades, capping fired players at D', () => {
    expect(gradeFor(900, false)).toBe('S');
    expect(gradeFor(600, false)).toBe('B');
    expect(gradeFor(900, true)).toBe('D');
    expect(gradeFor(100, false)).toBe('F');
  });

  it('produces a score breakdown and an archetype', () => {
    const s = planningState();
    const score = computeFinalScore(s);
    expect(score.lines.map((l) => l.key)).toEqual(['value', 'roi', 'adoption', 'risk', 'trust', 'morale']);
    expect(score.lines.reduce((sum, l) => sum + l.max, 0)).toBe(1000);
    expect(determineArchetype(s, score).name).toMatch(/^The /);
  });
});

describe('diff', () => {
  it('summarizes changes between states', () => {
    const s = planningState();
    const next = applyAction(s, { type: 'policy', policy: 'aup' });
    const changes = diffStates(s, next);
    expect(changes.find((c) => c.key === 'budget')?.positive).toBe(false);
    expect(changes.find((c) => c.key === 'risk')?.positive).toBe(true);
    expect(changes.some((c) => c.key === 'policy-aup')).toBe(true);
  });
});
