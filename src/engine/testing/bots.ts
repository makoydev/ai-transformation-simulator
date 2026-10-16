/**
 * Scripted players used by the test suite to verify game balance:
 * an expert should usually win, a random player should do worse, and an
 * idle player should get fired.
 */
import { EVENT_MAP } from '@/data/events';
import { USE_CASES } from '@/data/useCases';
import { DEPT_ORDER } from '@/data/departments';
import { applyAction, getActionCost, validateAction } from '../actions';
import { currentEvent, isChoiceAvailable, resolveEvent } from '../events';
import { nextRng } from '../rng';
import {
  activeProjectFor,
  capacityLeft,
  pilotCost,
  projectsIn,
  quarterlyCosts,
  readinessGap,
  caseOf,
} from '../selectors';
import { beginNextQuarter, endQuarter } from '../turn';
import type { GameAction, GameState, Verdict } from '../types';

export type Bot = {
  name: string;
  chooseEvent: (s: GameState) => string;
  plan: (s: GameState) => GameState;
};

const VERDICT_RANK: Record<Verdict, number> = { great: 3, good: 2, mixed: 1, bad: 0 };

function tryAction(s: GameState, a: GameAction): GameState | null {
  if (validateAction(s, a)) return null;
  return applyAction(s, a);
}

/** Expert: peeks at each choice's debrief verdict and picks the best one. */
function bestEventChoice(s: GameState): string {
  const ev = currentEvent(s)!;
  let best = ev.choices[0].id;
  let bestRank = -1;
  for (const choice of ev.choices) {
    if (!isChoiceAvailable(s, ev.id, choice.id)) continue;
    const { debrief } = resolveEvent(s, choice.id);
    const rank = debrief ? VERDICT_RANK[debrief.verdict] : 0;
    if (rank > bestRank) {
      bestRank = rank;
      best = choice.id;
    }
  }
  return best;
}

export const expertBot: Bot = {
  name: 'expert',
  chooseEvent: bestEventChoice,
  plan: (start) => {
    let s = start;
    const reserve = () => quarterlyCosts(s).total + 0.4;
    const act = (a: GameAction): boolean => {
      const cost = getActionCost(s, a);
      if (cost.budget > 0 && s.budget - cost.budget < reserve() && a.type !== 'scale') return false;
      const next = tryAction(s, a);
      if (!next) return false;
      s = next;
      return true;
    };

    // 1. Decide every pilot that has results.
    for (const p of projectsIn(s, 'results')) {
      const uc = caseOf(p);
      if (p.result === 'failed') {
        if (uc.ideal === p.approach && p.iterations === 0) act({ type: 'iterate', projectId: p.id });
        else act({ type: 'kill', projectId: p.id });
      } else if (uc.ideal !== p.approach && !uc.acceptable.includes(p.approach)) {
        act({ type: 'kill', projectId: p.id });
      } else {
        act({ type: 'scale', projectId: p.id, hitl: uc.sensitivity >= 0.7 });
      }
    }

    // 2. Foundations early.
    if (s.quarter === 1) act({ type: 'initiative', initiative: 'kpi' });

    // 3. Launch ideal pilots for discovered use cases, best value per dollar first.
    const candidates = USE_CASES.filter((uc) => s.departments[uc.dept].audited && !activeProjectFor(s, uc.id))
      .filter((uc) => !s.projects.some((p) => p.useCaseId === uc.id))
      .sort((a, b) => b.value / pilotCost(b, b.ideal) - a.value / pilotCost(a, a.ideal));
    for (const uc of candidates) {
      if (capacityLeft(s) === 0) break;
      if (readinessGap(s, uc, uc.ideal) > 10) {
        act({ type: 'dataSprint', dept: uc.dept });
        continue;
      }
      act({ type: 'launchPilot', useCaseId: uc.id, approach: uc.ideal });
    }

    // 4. Discover more use cases if the pipeline is thin.
    const pipeline = USE_CASES.filter((uc) => s.departments[uc.dept].audited && !activeProjectFor(s, uc.id)).length;
    if (pipeline < 2) {
      const next = DEPT_ORDER.find((d) => !s.departments[d].audited);
      if (next) act({ type: 'audit', dept: next });
    }

    // 5. Spend leftover capacity on governance and change.
    const extras: GameAction[] = [
      { type: 'policy', policy: 'aup' },
      { type: 'initiative', initiative: 'literacy' },
      { type: 'policy', policy: 'catalog' },
      { type: 'policy', policy: 'evals' },
      { type: 'policy', policy: 'review_board' },
      ...projectsIn(s, 'production').map((p) => ({ type: 'champions', dept: caseOf(p).dept }) as GameAction),
      { type: 'initiative', initiative: 'literacy' },
      { type: 'policy', policy: 'privacy' },
    ];
    for (const a of extras) {
      if (capacityLeft(s) === 0) break;
      act(a);
    }
    // Any remaining capacity: discover.
    while (capacityLeft(s) > 0) {
      const next = DEPT_ORDER.find((d) => !s.departments[d].audited);
      if (!next || !act({ type: 'audit', dept: next })) break;
    }
    return s;
  },
};

function botRandom(s: GameState): { value: number; s: GameState } {
  const r = nextRng(s.rng ^ 0x5bd1e995);
  return { value: r.value, s: { ...s, rng: r.state } };
}

export const randomBot: Bot = {
  name: 'random',
  chooseEvent: (s) => {
    const ev = currentEvent(s)!;
    const options = ev.choices.filter((c) => isChoiceAvailable(s, ev.id, c.id));
    const idx = Math.floor(((s.rng >>> 0) % 997) / 997 * options.length);
    return options[idx].id;
  },
  plan: (start) => {
    let s = start;
    const approaches = ['process', 'buy', 'rag', 'agentic', 'finetune', 'predictive'] as const;
    for (let i = 0; i < 12 && capacityLeft(s) > 0; i++) {
      const roll = botRandom(s);
      s = roll.s;
      const pickN = (n: number) => Math.floor(roll.value * 1000) % n;
      const results = projectsIn(s, 'results');
      let a: GameAction;
      if (results.length && roll.value < 0.5) {
        const p = results[pickN(results.length)];
        a = roll.value < 0.35 ? { type: 'scale', projectId: p.id, hitl: roll.value < 0.2 } : { type: 'kill', projectId: p.id };
      } else if (roll.value < 0.75) {
        const ucs = USE_CASES.filter((uc) => s.departments[uc.dept].audited && !activeProjectFor(s, uc.id));
        if (ucs.length) {
          const uc = ucs[pickN(ucs.length)];
          a = { type: 'launchPilot', useCaseId: uc.id, approach: approaches[pickN(approaches.length)] };
        } else {
          a = { type: 'audit', dept: DEPT_ORDER[pickN(DEPT_ORDER.length)] };
        }
      } else {
        a = { type: 'audit', dept: DEPT_ORDER[pickN(DEPT_ORDER.length)] };
      }
      s = tryAction(s, a) ?? s;
    }
    return s;
  },
};

export const idleBot: Bot = {
  name: 'idle',
  chooseEvent: (s) => {
    const ev = currentEvent(s)!;
    return ev.choices.find((c) => isChoiceAvailable(s, ev.id, c.id))!.id;
  },
  plan: (s) => s,
};

/** Plays a full game and returns the final state. */
export function playGame(bot: Bot, initial: GameState): GameState {
  let s = initial;
  for (let guard = 0; guard < 200; guard++) {
    if (s.phase === 'ended') return s;
    if (s.phase === 'event') {
      const choice = bot.chooseEvent(s);
      if (!EVENT_MAP[s.pendingEvents[0]]) throw new Error(`Unknown event ${s.pendingEvents[0]}`);
      s = resolveEvent(s, choice).state;
      continue;
    }
    if (s.phase === 'planning') {
      s = bot.plan(s);
      s = endQuarter(s);
      continue;
    }
    if (s.phase === 'report') {
      s = beginNextQuarter(s);
    }
  }
  throw new Error('Game did not terminate');
}
