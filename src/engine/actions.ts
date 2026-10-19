/**
 * Player actions during the planning phase. Each action has a capacity and
 * budget cost, a validation rule, and effects (including stakeholder
 * reactions and first-time debriefs).
 */
import { produce } from 'immer';
import { APPROACHES } from '@/data/approaches';
import { DEPARTMENTS } from '@/data/departments';
import { INITIATIVES, POLICIES } from '@/data/policies';
import { USE_CASE_MAP } from '@/data/useCases';
import { BALANCE } from './balance';
import {
  addDebrief,
  adoptPolicy,
  applyEffects,
  credit,
  debriefOnce,
  endProject,
  nid,
  say,
  shiftStakeholder,
  spend,
} from './effects';
import {
  activeProjectFor,
  capacityLeft,
  fitOf,
  killRefund,
  pilotCost,
  prodCost,
  round,
  caseOf,
} from './selectors';
import type { ActionCost, GameAction, GameState, InitiativeId, Project } from './types';

const LITERACY_COSTS = [0.4, 0.5, 0.6];

function findProject(s: GameState, id: string): Project | undefined {
  return s.projects.find((p) => p.id === id);
}

export function pendingHires(s: GameState): number {
  return Number(s.flags.pendingHires ?? 0);
}

export function initiativeCost(s: GameState, id: InitiativeId): ActionCost {
  switch (id) {
    case 'literacy':
      return { capacity: 1, budget: LITERACY_COSTS[Math.min(s.literacy, LITERACY_COSTS.length - 1)] };
    case 'townhall':
      return { capacity: 1, budget: 0.05 };
    case 'demoday':
      return { capacity: 1, budget: 0.1 };
    case 'expectations':
      return { capacity: 1, budget: 0 };
    case 'kpi':
      return { capacity: 1, budget: 0.25 };
    case 'hire':
      return { capacity: 1, budget: BALANCE.hireSigningCost };
  }
}

export function getActionCost(s: GameState, a: GameAction): ActionCost {
  switch (a.type) {
    case 'audit':
      return { capacity: 1, budget: BALANCE.auditCost };
    case 'launchPilot':
      return { capacity: 1, budget: pilotCost(USE_CASE_MAP[a.useCaseId], a.approach) };
    case 'iterate': {
      const p = findProject(s, a.projectId);
      if (!p) return { capacity: 1, budget: 0 };
      return { capacity: 1, budget: round(pilotCost(caseOf(p), p.approach) * BALANCE.iterateCostFactor, 2) };
    }
    case 'scale': {
      const p = findProject(s, a.projectId);
      if (!p) return { capacity: 1, budget: 0 };
      return { capacity: 1, budget: prodCost(caseOf(p), p.approach) };
    }
    case 'kill':
    case 'retire':
      return { capacity: 0, budget: 0 };
    case 'toggleHitl':
      return { capacity: 0, budget: BALANCE.hitlToggleCost };
    case 'dataSprint':
      return { capacity: 1, budget: BALANCE.dataSprintCost };
    case 'champions':
      return { capacity: 1, budget: BALANCE.championsCost };
    case 'policy':
      return { capacity: 1, budget: POLICIES[a.policy].cost };
    case 'initiative':
      return initiativeCost(s, a.initiative);
  }
}

/** Returns a human-readable reason the action is blocked, or null if allowed. */
export function validateAction(s: GameState, a: GameAction): string | null {
  if (s.phase !== 'planning') return 'Finish the current step first.';
  const cost = getActionCost(s, a);
  if (cost.capacity > capacityLeft(s)) return 'No team capacity left this quarter.';
  if (cost.budget > s.budget + 1e-9) return 'Not enough budget.';

  switch (a.type) {
    case 'audit':
      return s.departments[a.dept].audited ? 'Already audited.' : null;
    case 'launchPilot': {
      const uc = USE_CASE_MAP[a.useCaseId];
      if (!uc) return 'Unknown use case.';
      if (!s.departments[uc.dept].audited) return 'Audit the department first.';
      if (activeProjectFor(s, uc.id)) return 'This use case already has an active project.';
      return null;
    }
    case 'iterate': {
      const p = findProject(s, a.projectId);
      if (!p || p.stage !== 'results') return 'Only pilots with results can be iterated.';
      if (p.result === 'success') return 'This pilot already succeeded. Scale it instead.';
      if (p.iterations >= 2) return 'Two iterations already. Time to decide.';
      return null;
    }
    case 'scale': {
      const p = findProject(s, a.projectId);
      if (!p || p.stage !== 'results') return 'Only pilots with results can be scaled.';
      if (p.result === 'failed') return 'A failed pilot can\'t be scaled. Iterate or kill it.';
      return null;
    }
    case 'kill': {
      const p = findProject(s, a.projectId);
      return p && (p.stage === 'pilot' || p.stage === 'results') ? null : 'Only pilots can be killed.';
    }
    case 'retire': {
      const p = findProject(s, a.projectId);
      return p?.stage === 'production' ? null : 'Only production systems can be retired.';
    }
    case 'toggleHitl': {
      const p = findProject(s, a.projectId);
      if (!p || p.stage !== 'production') return 'Only production systems have HITL settings.';
      return p.approach === 'process' ? 'Process changes have no model to review.' : null;
    }
    case 'dataSprint': {
      const dept = s.departments[a.dept];
      if (!dept.audited) return 'Audit the department first.';
      return dept.dataReadiness >= 95 ? 'Data is already in great shape.' : null;
    }
    case 'champions': {
      const dept = s.departments[a.dept];
      if (!dept.audited) return 'Audit the department first.';
      return dept.champions ? 'Champions already active here.' : null;
    }
    case 'policy':
      return s.policies.includes(a.policy) ? 'Already in place.' : null;
    case 'initiative':
      switch (a.initiative) {
        case 'literacy':
          return s.literacy >= 3 ? 'Academy is at max level.' : null;
        case 'kpi':
          return s.kpiDashboard ? 'Already measuring.' : null;
        case 'hire':
          return s.hires + pendingHires(s) >= BALANCE.maxHires ? 'Hiring cap reached.' : null;
        case 'demoday':
          return s.flags.lastDemoQuarter === s.quarter ? 'One demo day per quarter.' : null;
        case 'expectations':
          if (s.flags.lastResetQuarter === s.quarter) return 'One briefing per quarter.';
          return s.hype <= 0.75 ? 'Expectations are already conservative.' : null;
        case 'townhall':
          return s.lastTownHall === s.quarter ? 'One town hall per quarter.' : null;
      }
  }
  return null;
}

function createProject(d: GameState, useCaseId: string, approach: Project['approach'], cost: number): Project {
  const ap = APPROACHES[approach];
  return {
    id: nid(d, 'proj'),
    useCaseId,
    approach,
    stage: 'pilot',
    startedQuarter: d.quarter,
    quartersRemaining: ap.pilotQuarters,
    iterations: 0,
    result: null,
    resultsQuarter: null,
    stalledQuarters: 0,
    productionQuarter: null,
    adoption: 0,
    hitl: false,
    valueRealized: 0,
    spend: cost,
    debriefId: null,
    endedQuarter: null,
  };
}

export function applyAction(state: GameState, a: GameAction): GameState {
  if (validateAction(state, a)) return state;
  const cost = getActionCost(state, a);

  return produce(state, (d) => {
    d.capacityUsed += cost.capacity;
    spend(d, cost.budget);

    switch (a.type) {
      case 'audit': {
        d.departments[a.dept].audited = true;
        d.stats.audits += 1;
        shiftStakeholder(d, DEPARTMENTS[a.dept].sponsor, 2);
        say(d, 'audit');
        debriefOnce(d, {
          kind: 'decision',
          verdict: 'good',
          title: 'Discovery before solutions',
          summary: `You audited ${DEPARTMENTS[a.dept].name}.`,
          insight:
            'Auditing reveals the real problems, the data you actually have, and which requests are really process issues. Read each use case\'s clues: they tell you whether the output is text, a number, or an action, and where the knowledge lives.',
          lessonId: 'discovery-first',
        });
        break;
      }

      case 'launchPilot': {
        const uc = USE_CASE_MAP[a.useCaseId];
        const fit = fitOf(uc, a.approach);
        const ap = APPROACHES[a.approach];
        d.projects.push(createProject(d, uc.id, a.approach, cost.budget));
        d.stats.pilotsLaunched += 1;
        if (fit === 'ideal') d.stats.idealPicks += 1;
        else if (fit === 'acceptable') d.stats.acceptablePicks += 1;
        else d.stats.poorPicks += 1;
        if (a.approach === 'process') d.stats.processFixes += 1;
        if (ap.category === 'buy') d.stats.buyPicks += 1;
        if (ap.category === 'build') d.stats.buildPicks += 1;
        if (a.approach === 'agentic') d.stats.agenticPicks += 1;

        shiftStakeholder(d, DEPARTMENTS[uc.dept].sponsor, 2);
        if (ap.category === 'build') shiftStakeholder(d, 'cto', 3);
        if (ap.category === 'buy') shiftStakeholder(d, 'cto', -2);
        if (a.approach === 'process') {
          shiftStakeholder(d, 'cfo', 2);
          shiftStakeholder(d, 'coo', 3);
        }
        if (a.approach === 'agentic') {
          shiftStakeholder(d, 'ceo', 3);
          shiftStakeholder(d, 'ciso', -2);
        }
        say(
          d,
          a.approach === 'process'
            ? 'pilot_process'
            : a.approach === 'buy'
              ? 'pilot_buy'
              : a.approach === 'agentic'
                ? 'pilot_agentic'
                : 'pilot_build',
        );
        break;
      }

      case 'iterate': {
        const p = findProject(d, a.projectId)!;
        p.stage = 'pilot';
        p.quartersRemaining = 1;
        p.iterations += 1;
        p.result = null;
        p.resultsQuarter = null;
        p.stalledQuarters = 0;
        p.spend = round(p.spend + cost.budget);
        d.stats.iterations += 1;
        break;
      }

      case 'scale': {
        const p = findProject(d, a.projectId)!;
        const uc = caseOf(p);
        const ap = APPROACHES[p.approach];
        p.stage = 'production';
        p.productionQuarter = d.quarter;
        p.hitl = p.approach === 'process' ? false : a.hitl;
        p.adoption = Math.min(BALANCE.adoption.max, ap.startAdoption + (p.approach === 'process' ? 0 : d.literacy * 3));
        p.spend = round(p.spend + cost.budget);
        d.stats.scaled += 1;
        shiftStakeholder(d, DEPARTMENTS[uc.dept].sponsor, 5);
        shiftStakeholder(d, 'ceo', 4);
        say(d, 'scale');

        const sensitive = uc.sensitivity >= 0.7 && p.approach !== 'process';
        if (sensitive && p.hitl) {
          d.stats.hitlOnSensitive += 1;
          shiftStakeholder(d, 'ciso', 3);
          debriefOnce(d, {
            kind: 'decision',
            verdict: 'great',
            title: 'Human-in-the-loop on a high-stakes system',
            summary: `You scaled "${uc.title}" with human review in place.`,
            insight:
              'You traded about 15% of efficiency for a large cut in risk. With errors that are costly, public, or regulated, that is the right trade. Oversight is a dial: turn it up where mistakes hurt, down where they don\'t.',
            lessonId: 'hitl',
          });
        } else if (sensitive && !p.hitl) {
          d.stats.hitlOffSensitive += 1;
          shiftStakeholder(d, 'ciso', -6);
          say(d, 'scale_no_hitl');
          addDebrief(d, {
            kind: 'decision',
            verdict: 'bad',
            title: 'Full autonomy on a high-stakes system',
            summary: `You scaled "${uc.title}" without human review.`,
            insight:
              'This system touches sensitive, regulated, or customer-facing decisions. Without human review, every error ships directly, and your risk exposure just jumped. You can still switch HITL on from the Portfolio.',
            lessonId: 'hitl',
          });
        }

        if (d.stats.scaled === 1) {
          debriefOnce(d, {
            kind: 'decision',
            verdict: 'good',
            title: 'Your first system in production',
            summary: `"${uc.title}" is live.`,
            insight:
              'Production is where value starts, but only at the rate people adopt it. Watch adoption on the Portfolio tab: training, champions, and morale all speed it up.',
            lessonId: 'quick-wins',
          });
        }
        break;
      }

      case 'kill': {
        const p = findProject(d, a.projectId)!;
        const uc = caseOf(p);
        const fit = fitOf(uc, p.approach);
        const ap = APPROACHES[p.approach];
        if (p.stage === 'pilot') credit(d, killRefund(p));
        const winner = p.result === 'success' && fit !== 'poor';
        const smart = fit === 'poor' || p.result === 'failed' || (p.result === 'mixed' && fit !== 'ideal');
        d.stats.killed += 1;
        if (ap.category === 'build') shiftStakeholder(d, 'cto', -3);

        if (winner) {
          d.stats.killedWinners += 1;
          shiftStakeholder(d, 'ceo', -4);
          say(d, 'kill_winner');
          addDebrief(d, {
            kind: 'decision',
            verdict: 'bad',
            title: 'You killed a winner',
            summary: `You shut down "${uc.title}" after a successful pilot.`,
            insight:
              'Kill decisions should follow evidence. This pilot met its success criteria with a fitting approach. Killing it throws away the learning and the momentum, and it tells teams that results don\'t matter.',
            lessonId: 'portfolio',
          });
        } else if (smart) {
          d.stats.killedSmart += 1;
          shiftStakeholder(d, 'cfo', 4);
          say(d, 'kill_smart');
          debriefOnce(d, {
            kind: 'decision',
            verdict: 'great',
            title: 'Killing fast is a skill',
            summary: `You shut down "${uc.title}".`,
            insight:
              'This pilot was not going to deliver enough value. Cutting it frees budget and capacity for better bets, and it shows the board you manage a portfolio rather than defend pet projects.',
            lessonId: 'kill-fast',
          });
        } else {
          debriefOnce(d, {
            kind: 'decision',
            verdict: 'mixed',
            title: 'Stopped before the evidence was in',
            summary: `You shut down "${uc.title}" early.`,
            insight:
              'You stopped a reasonably well-fitted pilot without evidence that it was failing. Define kill criteria up front so these calls are based on data, not anxiety.',
            lessonId: 'kill-fast',
          });
        }
        endProject(d, p, 'killed');
        break;
      }

      case 'retire': {
        const p = findProject(d, a.projectId)!;
        if (fitOf(caseOf(p), p.approach) === 'poor') shiftStakeholder(d, 'cfo', 2);
        d.stats.retired += 1;
        endProject(d, p, 'retired');
        say(d, 'retire');
        break;
      }

      case 'toggleHitl': {
        const p = findProject(d, a.projectId)!;
        p.hitl = !p.hitl;
        shiftStakeholder(d, 'ciso', p.hitl ? 3 : -3);
        break;
      }

      case 'dataSprint': {
        const dept = d.departments[a.dept];
        dept.dataReadiness = Math.min(95, dept.dataReadiness + BALANCE.dataSprintGain);
        shiftStakeholder(d, 'cto', 2);
        say(d, 'data_sprint');
        debriefOnce(d, {
          kind: 'decision',
          verdict: 'good',
          title: 'Fixing data where it matters',
          summary: `You ran a data foundation sprint in ${DEPARTMENTS[a.dept].name}.`,
          insight:
            'Targeted data work (digitizing documents, de-duplicating records, assigning owners) unblocks specific use cases now instead of waiting years for a perfect enterprise platform.',
          lessonId: 'data-product',
        });
        break;
      }

      case 'champions': {
        d.departments[a.dept].champions = true;
        d.stats.changeActions += 1;
        applyEffects(d, { morale: 2, stakeholders: { chro: 3 } });
        say(d, 'champions');
        debriefOnce(d, {
          kind: 'decision',
          verdict: 'great',
          title: 'Champions beat mandates',
          summary: `You recruited AI champions in ${DEPARTMENTS[a.dept].name}.`,
          insight:
            'Peers showing peers how they use AI is the fastest adoption engine there is. Projects in this department now gain adoption much faster every quarter.',
          lessonId: 'grassroots',
        });
        break;
      }

      case 'policy': {
        const def = POLICIES[a.policy];
        adoptPolicy(d, a.policy);
        say(d, a.policy === 'review_board' ? 'review_board' : 'policy');
        debriefOnce(d, {
          kind: 'decision',
          verdict: 'good',
          title: def.name,
          summary: `You adopted the ${def.name}.`,
          insight: `${def.description} ${def.benefit} Governance is cheapest before the incident, not after it.`,
          lessonId: def.lessonId,
        });
        break;
      }

      case 'initiative': {
        const def = INITIATIVES[a.initiative];
        switch (a.initiative) {
          case 'literacy':
            d.literacy += 1;
            d.stats.changeActions += 1;
            applyEffects(d, { morale: 5, stakeholders: def.stakeholders });
            say(d, 'literacy');
            debriefOnce(d, {
              kind: 'decision',
              verdict: 'great',
              title: 'AI literacy is infrastructure',
              summary: 'You launched the AI Literacy Academy.',
              insight:
                'Trained employees adopt faster, make fewer risky mistakes, and surface better use cases. Every production project now gains adoption faster each quarter.',
              lessonId: def.lessonId,
            });
            break;
          case 'townhall': {
            const recent = d.lastTownHall !== null && d.quarter - d.lastTownHall <= 1;
            d.lastTownHall = d.quarter;
            d.stats.changeActions += 1;
            applyEffects(d, { morale: recent ? 3 : 10, stakeholders: recent ? {} : def.stakeholders });
            say(d, recent ? 'townhall_repeat' : 'townhall');
            if (!recent) {
              debriefOnce(d, {
                kind: 'decision',
                verdict: 'good',
                title: 'Transparency calms fear',
                summary: 'You held an all-hands town hall about AI.',
                insight:
                  'Silence gets filled with the worst possible rumor. Explaining what AI will and won\'t change, and what happens to jobs, keeps people engaged instead of quietly resisting.',
                lessonId: def.lessonId,
              });
            }
            break;
          }
          case 'demoday':
            d.flags.lastDemoQuarter = d.quarter;
            d.stats.demoDays += 1;
            applyEffects(d, { trust: 6, hype: 0.15, stakeholders: def.stakeholders });
            say(d, 'demoday');
            debriefOnce(d, {
              kind: 'decision',
              verdict: 'mixed',
              title: 'Hype is debt',
              summary: 'You ran an executive demo day.',
              insight:
                'Demos buy trust today by borrowing against tomorrow: the board now expects 15% more value every quarter. Use demos to show real results, not to substitute for them.',
              lessonId: def.lessonId,
            });
            break;
          case 'expectations':
            d.flags.lastResetQuarter = d.quarter;
            d.stats.expectationResets += 1;
            applyEffects(d, { trust: -2, hype: -0.15, stakeholders: def.stakeholders });
            say(d, 'expectations');
            debriefOnce(d, {
              kind: 'decision',
              verdict: 'good',
              title: 'Underpromise, overdeliver',
              summary: 'You reset the board\'s expectations.',
              insight:
                'Enterprise AI value follows an adoption curve, not a launch date. Realistic targets cost a little trust now and protect a lot of it later.',
              lessonId: def.lessonId,
            });
            break;
          case 'kpi':
            d.kpiDashboard = true;
            applyEffects(d, { stakeholders: def.stakeholders });
            say(d, 'kpi');
            debriefOnce(d, {
              kind: 'decision',
              verdict: 'great',
              title: 'Measure value or lose it',
              summary: 'You built baselines and a KPI dashboard.',
              insight:
                'Unmeasured value is invisible to the board. They were only crediting about 65% of what you delivered. Now they see all of it, in business terms they trust.',
              lessonId: def.lessonId,
            });
            break;
          case 'hire':
            d.flags.pendingHires = pendingHires(d) + 1;
            applyEffects(d, { stakeholders: def.stakeholders });
            say(d, 'hire');
            debriefOnce(d, {
              kind: 'decision',
              verdict: 'good',
              title: 'Capacity is strategy',
              summary: 'You hired an AI engineering squad.',
              insight:
                'More capacity means more initiatives per quarter, but salaries recur forever. Hire when you have a pipeline of good use cases to feed the team.',
              lessonId: def.lessonId,
            });
            break;
        }
        break;
      }
    }
  });
}
