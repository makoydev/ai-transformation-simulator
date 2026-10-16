/**
 * Pure derived values. The UI and the engine both read game state through
 * these so the numbers on screen always match the simulation.
 */
import { APPROACHES } from '@/data/approaches';
import { POLICIES } from '@/data/policies';
import { SCENARIOS } from '@/data/scenarios';
import { STAKEHOLDERS, STAKEHOLDER_ORDER } from '@/data/stakeholders';
import { USE_CASE_MAP, type UseCaseDef } from '@/data/useCases';
import { BALANCE } from './balance';
import type { ApproachId, Fit, GameState, Project } from './types';

export const clamp = (v: number, min = 0, max = 100): number => Math.min(max, Math.max(min, v));
export const round = (v: number, digits = 3): number => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

export const scenarioOf = (s: GameState) => SCENARIOS[s.scenarioId];
export const caseOf = (p: Project): UseCaseDef => USE_CASE_MAP[p.useCaseId];

export function fitOf(uc: UseCaseDef, approach: ApproachId): Fit {
  if (uc.ideal === approach) return 'ideal';
  if (uc.acceptable.includes(approach)) return 'acceptable';
  return 'poor';
}

export const hasPolicy = (s: GameState, id: GameState['policies'][number]) => s.policies.includes(id);

// ── Capacity ──────────────────────────────────────────────────────────────
export const capacityTotal = (s: GameState): number =>
  Math.max(0, BALANCE.baseCapacity + s.hires + s.capacityBonus);
export const capacityLeft = (s: GameState): number => Math.max(0, capacityTotal(s) - s.capacityUsed);

// ── Projects ──────────────────────────────────────────────────────────────
export const isActive = (p: Project): boolean => p.stage !== 'killed' && p.stage !== 'retired';
export const activeProjectFor = (s: GameState, useCaseId: string): Project | undefined =>
  s.projects.find((p) => p.useCaseId === useCaseId && isActive(p));
export const projectsIn = (s: GameState, stage: Project['stage']): Project[] =>
  s.projects.filter((p) => p.stage === stage);
export const productionProjects = (s: GameState): Project[] => projectsIn(s, 'production');

export function pilotCost(uc: UseCaseDef, approach: ApproachId): number {
  return round(APPROACHES[approach].pilotCost * uc.scale, 2);
}
export function prodCost(uc: UseCaseDef, approach: ApproachId): number {
  return round(APPROACHES[approach].prodCost * uc.scale, 2);
}
export function runCostOf(uc: UseCaseDef, approach: ApproachId): number {
  return round(APPROACHES[approach].runCost * uc.scale, 3);
}

/** Value a project would generate per quarter at 100% adoption. */
export function potentialValue(p: Project): number {
  const uc = caseOf(p);
  const fit = fitOf(uc, p.approach);
  const resultMult = p.result ? BALANCE.resultValue[p.result] : 1;
  const hitlMult = p.hitl && p.approach !== 'process' ? BALANCE.hitlValueFactor : 1;
  return uc.value * BALANCE.valueScale * BALANCE.fitValue[fit] * resultMult * hitlMult;
}

export function projectValue(p: Project): number {
  if (p.stage !== 'production') return 0;
  return potentialValue(p) * (p.adoption / 100);
}

export function runRate(s: GameState): number {
  return productionProjects(s).reduce((sum, p) => sum + projectValue(p), 0);
}

export function quarterlyCosts(s: GameState): { projects: number; team: number; policies: number; total: number } {
  const projects = productionProjects(s).reduce((sum, p) => sum + runCostOf(caseOf(p), p.approach), 0);
  const team = s.hires * BALANCE.hireCostPerQuarter;
  const policies = s.policies.reduce((sum, id) => sum + POLICIES[id].upkeep, 0);
  return { projects, team, policies, total: round(projects + team + policies) };
}

export function avgAdoption(s: GameState): number {
  const prod = productionProjects(s);
  if (prod.length === 0) return 0;
  return prod.reduce((sum, p) => sum + p.adoption, 0) / prod.length;
}

// ── Risk ──────────────────────────────────────────────────────────────────
/** Share of project risk neutralized by governance policies (0–0.6). */
export function mitigation(s: GameState, uc: UseCaseDef, approach: ApproachId): number {
  let m = 0;
  if (hasPolicy(s, 'aup')) m += 0.05;
  if (hasPolicy(s, 'review_board')) m += 0.12;
  if (hasPolicy(s, 'evals') && ['rag', 'agentic', 'finetune'].includes(approach)) m += 0.18;
  if (hasPolicy(s, 'privacy') && uc.sensitivity >= 0.6) m += 0.15;
  if (hasPolicy(s, 'bias_audit') && uc.tags.includes('people')) m += 0.25;
  return Math.min(0.6, m);
}

export function projectRisk(s: GameState, p: Project): number {
  if (!isActive(p) || p.stage === 'results') return 0;
  const uc = caseOf(p);
  const ap = APPROACHES[p.approach];
  const stageFactor = p.stage === 'pilot' ? BALANCE.risk.pilotFactor : 1;
  const hitlFactor = p.hitl ? BALANCE.hitlRiskFactor : 1;
  return (
    ap.riskWeight * uc.sensitivity * BALANCE.risk.projectScale * stageFactor * hitlFactor * (1 - mitigation(s, uc, p.approach))
  );
}

export function totalRisk(s: GameState): number {
  const projectTotal = s.projects.reduce((sum, p) => sum + projectRisk(s, p), 0);
  return clamp(s.riskBase + projectTotal * scenarioOf(s).regulation);
}

export function riskLevel(risk: number): 'Low' | 'Moderate' | 'High' | 'Critical' {
  if (risk < 25) return 'Low';
  if (risk < 45) return 'Moderate';
  if (risk < 65) return 'High';
  return 'Critical';
}

// ── Board expectations ────────────────────────────────────────────────────
export function expectedRunRate(s: GameState, quarter = s.quarter): number {
  const curve = scenarioOf(s).expectations;
  const base = curve[Math.min(curve.length - 1, Math.max(0, quarter - 1))];
  return round(base * s.hype, 3);
}

export const measuredFactor = (s: GameState): number => (s.kpiDashboard ? 1 : BALANCE.unmeasuredValueFactor);

export const roi = (s: GameState): number => (s.cumulativeSpend > 0 ? s.cumulativeValue / s.cumulativeSpend : 0);

// ── Data readiness & pilot odds ───────────────────────────────────────────
export function readinessRequired(uc: UseCaseDef, approach: ApproachId): number {
  return Math.round(uc.dataRequirement * APPROACHES[approach].dataMult);
}

export function readinessGap(s: GameState, uc: UseCaseDef, approach: ApproachId): number {
  return Math.max(0, readinessRequired(uc, approach) - s.departments[uc.dept].dataReadiness);
}

export function pilotSuccessChance(s: GameState, uc: UseCaseDef, approach: ApproachId, iterations: number): number {
  const fit = fitOf(uc, approach);
  let chance = BALANCE.pilotSuccess[fit];
  if (hasPolicy(s, 'evals') && approach !== 'process') chance += BALANCE.evalsSuccessBonus;
  chance += iterations * BALANCE.iterationSuccessBonus;
  chance -= readinessGap(s, uc, approach) * BALANCE.readinessPenalty;
  return clamp(chance, 0.05, 0.95);
}

// ── Stakeholders ──────────────────────────────────────────────────────────
export function stakeholderAverage(s: GameState): number {
  let total = 0;
  let weights = 0;
  for (const id of STAKEHOLDER_ORDER) {
    total += s.stakeholders[id] * STAKEHOLDERS[id].weight;
    weights += STAKEHOLDERS[id].weight;
  }
  return total / weights;
}

export function mood(value: number): 'hostile' | 'wary' | 'neutral' | 'supportive' | 'champion' {
  if (value < 25) return 'hostile';
  if (value < 42) return 'wary';
  if (value < 60) return 'neutral';
  if (value < 78) return 'supportive';
  return 'champion';
}

// ── PoC purgatory ─────────────────────────────────────────────────────────
export const stalledProjects = (s: GameState): Project[] =>
  projectsIn(s, 'results').filter((p) => p.stalledQuarters >= 1);

// ── Use case status for the UI ────────────────────────────────────────────
export type UseCaseStatus = 'undiscovered' | 'discovered' | 'pilot' | 'results' | 'production';
export function useCaseStatus(s: GameState, uc: UseCaseDef): UseCaseStatus {
  if (!s.departments[uc.dept].audited) return 'undiscovered';
  const p = activeProjectFor(s, uc.id);
  if (!p) return 'discovered';
  return p.stage as UseCaseStatus;
}
