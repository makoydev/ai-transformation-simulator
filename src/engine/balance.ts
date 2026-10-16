/**
 * Tunable game-balance constants. Kept in one place so the scoring model is
 * transparent (and documented in the README) and easy to tweak.
 */
export const BALANCE = {
  maxQuarters: 8,
  baseCapacity: 3,
  maxHires: 3,
  hireSigningCost: 0.15,
  hireCostPerQuarter: 0.22,

  fireThreshold: 15,
  warningThreshold: 30,

  auditCost: 0.05,
  dataSprintCost: 0.35,
  dataSprintGain: 22,
  championsCost: 0.15,
  hitlToggleCost: 0.05,
  iterateCostFactor: 0.4,
  killRefundFactor: 0.3,

  /** Base chance a pilot "works" by approach fit. */
  pilotSuccess: { ideal: 0.82, acceptable: 0.6, poor: 0.4 },
  /** Global multiplier on every use case's value potential. */
  valueScale: 1.8,
  /** Share of a use case's value potential an approach can capture. */
  fitValue: { ideal: 1, acceptable: 0.6, poor: 0.22 },
  /** Value multiplier by pilot outcome. */
  resultValue: { success: 1, mixed: 0.55, failed: 0 },
  evalsSuccessBonus: 0.08,
  iterationSuccessBonus: 0.15,
  /** Success chance lost per point of data-readiness gap. */
  readinessPenalty: 0.012,

  hitlValueFactor: 0.85,
  hitlRiskFactor: 0.45,
  hitlAdoptionBonus: 2,

  /** Board only gives partial credit for value it can't see measured. */
  unmeasuredValueFactor: 0.65,

  adoption: {
    base: 5,
    perLiteracy: 4,
    champions: 8,
    processBonus: 10,
    catalogBuyBonus: 3,
    max: 95,
    min: 5,
  },

  risk: {
    projectScale: 28,
    pilotFactor: 0.25,
    shadowDrift: 2.5,
    shadowDriftWithAup: 1,
    shadowDriftCap: 45,
  },

  trust: {
    honeymoon: 2,
    valueSwing: 10,
    maxGain: 8,
    maxLoss: -10,
    supportDivisor: 8,
    purgatoryPenalty: 2,
    purgatoryCap: 8,
    overspendPenalty: 8,
    riskThreshold: 60,
    /** Below this share of target, a quarter counts as a "miss" for the patience streak. */
    missRatio: 0.6,
    /** Extra trust lost per consecutive missed quarter after the first. */
    missStreakPenalty: 3,
    lowMoraleThreshold: 25,
  },

  incident: {
    riskFloor: 25,
    maxChance: 0.55,
  },
} as const;
