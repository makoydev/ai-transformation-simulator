import { SCENARIOS } from '@/data/scenarios';
import { STAKEHOLDER_ORDER } from '@/data/stakeholders';
import { BALANCE } from './balance';
import { randomSeed } from './rng';
import type { DeptId, GameState, GameStats, ScenarioId, StakeholderId } from './types';

export const SAVE_VERSION = 1;

const emptyStats = (): GameStats => ({
  audits: 0,
  pilotsLaunched: 0,
  idealPicks: 0,
  acceptablePicks: 0,
  poorPicks: 0,
  processFixes: 0,
  buildPicks: 0,
  buyPicks: 0,
  agenticPicks: 0,
  scaled: 0,
  killed: 0,
  killedSmart: 0,
  killedWinners: 0,
  retired: 0,
  iterations: 0,
  demoDays: 0,
  expectationResets: 0,
  incidents: 0,
  eventsGreat: 0,
  eventsBad: 0,
  maxPurgatory: 0,
  purgatoryQuarters: 0,
  hitlOnSensitive: 0,
  hitlOffSensitive: 0,
  peakRisk: 0,
  changeActions: 0,
});

export function createInitialState(scenarioId: ScenarioId, playerName = '', seed = randomSeed()): GameState {
  const sc = SCENARIOS[scenarioId];
  const departments = Object.fromEntries(
    (Object.keys(sc.dataReadiness) as DeptId[]).map((id) => [
      id,
      { audited: false, dataReadiness: sc.dataReadiness[id], champions: false },
    ]),
  ) as GameState['departments'];
  const stakeholders = Object.fromEntries(
    STAKEHOLDER_ORDER.map((id) => [id, sc.stakeholders[id] ?? 50]),
  ) as Record<StakeholderId, number>;

  return {
    version: SAVE_VERSION,
    seed,
    rng: seed,
    scenarioId,
    playerName: playerName.trim().slice(0, 40),
    quarter: 1,
    maxQuarters: BALANCE.maxQuarters,
    phase: 'event',
    capacityUsed: 0,
    capacityBonus: 0,
    hires: 0,
    budget: sc.startBudget,
    trust: sc.startTrust,
    morale: sc.startMorale,
    hype: 1,
    riskBase: sc.startRiskBase,
    cumulativeValue: 0,
    cumulativeSpend: 0,
    departments,
    projects: [],
    stakeholders,
    policies: [],
    literacy: 0,
    kpiDashboard: false,
    lastTownHall: null,
    flags: {},
    pendingEvents: ['kickoff'],
    seenEvents: [],
    history: [],
    lastReport: null,
    debriefs: [],
    lessons: [],
    inbox: [],
    stats: emptyStats(),
    outcome: null,
    nextId: 0,
  };
}
