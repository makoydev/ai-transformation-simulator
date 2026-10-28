import type { DeptId, ScenarioId, StakeholderId } from '@/engine/types';

export interface ScenarioDef {
  id: ScenarioId;
  company: string;
  industry: string;
  tagline: string;
  difficulty: 'Relaxed' | 'Standard' | 'Brutal';
  description: string;
  startBudget: number;
  /** Base quarterly budget allocation, scaled by board trust. */
  allocation: number;
  startTrust: number;
  startMorale: number;
  startRiskBase: number;
  /** Multiplier on project risk: regulated industries punish mistakes harder. */
  regulation: number;
  /** Board-expected value run-rate ($M/quarter) for each quarter, before hype. */
  expectations: number[];
  /** Cumulative value for a perfect value score. */
  valueTarget: number;
  dataReadiness: Record<DeptId, number>;
  stakeholders: Partial<Record<StakeholderId, number>>;
}

export const SCENARIOS: Record<ScenarioId, ScenarioDef> = {
  lumen: {
    id: 'lumen',
    company: 'Lumen Home & Living',
    industry: 'Omnichannel retail',
    tagline: 'A beloved 60-year-old retailer with a CEO who just discovered AI on a podcast.',
    difficulty: 'Relaxed',
    description:
      'Bigger budget, lighter regulation, and a patient board. A good place to learn the fundamentals.',
    startBudget: 5,
    allocation: 2.5,
    startTrust: 60,
    startMorale: 56,
    startRiskBase: 18,
    regulation: 0.85,
    expectations: [0, 0.18, 0.5, 1.05, 1.65, 2.4, 3.15, 3.9],
    valueTarget: 15,
    dataReadiness: {
      support: 50,
      finance: 55,
      legal: 40,
      hr: 45,
      engineering: 60,
      sales: 45,
      operations: 55,
      marketing: 60,
    },
    stakeholders: { ceo: 62, cfo: 50, ciso: 52, coo: 50, chro: 55, cto: 55 },
  },
  pemberton: {
    id: 'pemberton',
    company: 'Pemberton Logistics',
    industry: 'Freight & logistics',
    tagline: 'Est. 1931. Moves 4 million shipments a year. Still faxes purchase orders.',
    difficulty: 'Standard',
    description: 'A traditional company with mixed data, a skeptical COO, and a board that wants proof.',
    startBudget: 4,
    allocation: 2.2,
    startTrust: 55,
    startMorale: 50,
    startRiskBase: 22,
    regulation: 1,
    expectations: [0, 0.22, 0.65, 1.25, 1.95, 2.75, 3.6, 4.4],
    valueTarget: 16,
    dataReadiness: {
      support: 45,
      finance: 50,
      legal: 35,
      hr: 40,
      engineering: 55,
      sales: 35,
      operations: 45,
      marketing: 50,
    },
    stakeholders: { ceo: 58, cfo: 45, ciso: 48, coo: 40, chro: 52, cto: 55 },
  },
  crestline: {
    id: 'crestline',
    company: 'Crestline Mutual',
    industry: 'Insurance & financial services',
    tagline: 'A 112-year-old insurer. Every decision is regulated. Every mistake is a headline.',
    difficulty: 'Brutal',
    description:
      'Tight budget, heavy regulation, nervous employees, and a board that has read every AI horror story.',
    startBudget: 3.6,
    allocation: 2,
    startTrust: 50,
    startMorale: 42,
    startRiskBase: 28,
    regulation: 1.35,
    expectations: [0, 0.26, 0.75, 1.4, 2.15, 3, 3.9, 4.8],
    valueTarget: 16,
    dataReadiness: {
      support: 40,
      finance: 50,
      legal: 35,
      hr: 35,
      engineering: 45,
      sales: 35,
      operations: 40,
      marketing: 40,
    },
    stakeholders: { ceo: 55, cfo: 42, ciso: 40, coo: 42, chro: 48, cto: 50 },
  },
};

export const SCENARIO_ORDER: ScenarioId[] = ['lumen', 'pemberton', 'crestline'];

/** How long a game is, for the title and setup screens. */
export const GAME_LENGTH = '8 quarters · saves after every move, so you can stop and come back anytime';
