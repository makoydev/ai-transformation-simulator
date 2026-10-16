import { POLICIES } from '@/data/policies';
import { STAKEHOLDER_ORDER } from '@/data/stakeholders';
import { avgAdoption, capacityLeft, productionProjects, totalRisk } from './selectors';
import type { GameState, StakeholderId } from './types';

export interface Change {
  key: string;
  label: string;
  delta: number;
  format: 'money' | 'points' | 'percent' | 'flag';
  /** Whether this change is good for the player. */
  positive: boolean;
}

export const STAKEHOLDER_SHORT: Record<StakeholderId, string> = {
  ceo: 'CEO',
  cfo: 'CFO',
  ciso: 'CISO',
  coo: 'COO',
  chro: 'CHRO',
  cto: 'CTO',
};

/** Summarizes what changed between two states, for effect chips in the UI. */
export function diffStates(a: GameState, b: GameState): Change[] {
  const changes: Change[] = [];
  const push = (key: string, label: string, delta: number, format: Change['format'], higherIsBetter = true) => {
    const threshold = format === 'money' ? 0.005 : format === 'percent' ? 0.5 : 0.5;
    if (Math.abs(delta) < threshold) return;
    changes.push({ key, label, delta, format, positive: higherIsBetter ? delta > 0 : delta < 0 });
  };

  push('budget', 'Budget', b.budget - a.budget, 'money');
  push('trust', 'Board trust', b.trust - a.trust, 'points');
  push('morale', 'Morale', b.morale - a.morale, 'points');
  push('risk', 'Risk', Math.round(totalRisk(b)) - Math.round(totalRisk(a)), 'points', false);
  push('hype', 'Exec hype', (b.hype - a.hype) * 100, 'percent', false);
  if (productionProjects(a).length || productionProjects(b).length) {
    push('adoption', 'Adoption', Math.round(avgAdoption(b)) - Math.round(avgAdoption(a)), 'points');
  }
  push('capacity', 'Capacity', capacityLeft(b) - capacityLeft(a), 'points');

  for (const id of STAKEHOLDER_ORDER) {
    push(`sh-${id}`, STAKEHOLDER_SHORT[id], b.stakeholders[id] - a.stakeholders[id], 'points');
  }
  for (const policy of b.policies) {
    if (!a.policies.includes(policy)) {
      changes.push({ key: `policy-${policy}`, label: POLICIES[policy].name, delta: 1, format: 'flag', positive: true });
    }
  }
  const retired = b.projects.filter(
    (p) => p.stage === 'retired' && a.projects.find((x) => x.id === p.id)?.stage !== 'retired',
  ).length;
  if (retired) changes.push({ key: 'retired', label: 'Systems retired', delta: -retired, format: 'points', positive: false });
  return changes;
}
