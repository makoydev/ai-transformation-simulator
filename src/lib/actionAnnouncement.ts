import { APPROACHES } from '@/data/approaches';
import { DEPARTMENTS } from '@/data/departments';
import { INITIATIVES, POLICIES } from '@/data/policies';
import { USE_CASE_MAP, USE_CASES } from '@/data/useCases';
import { diffStates, sel, type GameAction, type GameState } from '@/engine';
import { fmtChange } from './format';

/** What an action did, in a few words: "Audited Finance", "Invoice Matching scaled to production". */
function actionText(s: GameState, action: GameAction): string {
  const title = (projectId: string) => {
    const p = s.projects.find((x) => x.id === projectId);
    return p ? USE_CASE_MAP[p.useCaseId].title : 'Project';
  };
  switch (action.type) {
    case 'audit':
      return `Audited ${DEPARTMENTS[action.dept].name}: ${USE_CASES.filter((uc) => uc.dept === action.dept).length} use cases revealed`;
    case 'launchPilot':
      return `${APPROACHES[action.approach].name} pilot launched for ${USE_CASE_MAP[action.useCaseId].title}`;
    case 'iterate':
      return `Iterating on ${title(action.projectId)}`;
    case 'scale':
      return `${title(action.projectId)} scaled to production${action.hitl ? ' with human review' : ''}`;
    case 'kill':
      return `${title(action.projectId)} killed`;
    case 'retire':
      return `${title(action.projectId)} retired`;
    case 'toggleHitl': {
      const on = s.projects.find((p) => p.id === action.projectId)?.hitl;
      return `Human review turned ${on ? 'on' : 'off'} for ${title(action.projectId)}`;
    }
    case 'dataSprint':
      return `Data sprint run in ${DEPARTMENTS[action.dept].name}: data readiness now ${s.departments[action.dept].dataReadiness}`;
    case 'champions':
      return `Champions appointed in ${DEPARTMENTS[action.dept].name}`;
    case 'policy':
      return `${POLICIES[action.policy].name} adopted`;
    case 'initiative':
      return `${INITIATIVES[action.initiative].name} funded`;
  }
}

/**
 * A screen reader summary of an action and its effect on the numbers, e.g. "Predictive ML pilot
 * launched for Demand Forecasting. Budget −$720K, Risk +3. 1 of 3 capacity left."
 */
export function actionAnnouncement(before: GameState, after: GameState, action: GameAction): string {
  // Capacity gets its own sentence; a newly adopted policy is already named by the action.
  const changes = diffStates(before, after)
    .filter((c) => c.key !== 'capacity' && c.format !== 'flag')
    .map(fmtChange);
  const left = sel.capacityLeft(after);
  return [
    `${actionText(after, action)}.`,
    changes.length ? `${changes.join(', ')}.` : '',
    `${left} of ${sel.capacityTotal(after)} capacity left.`,
  ]
    .filter(Boolean)
    .join(' ');
}
