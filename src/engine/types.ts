/**
 * Core domain types for the AI Transformation Simulator.
 *
 * Everything in GameState is plain, serializable data so it can be
 * persisted to localStorage and replayed deterministically from a seed.
 */

export type DeptId =
  | 'support'
  | 'finance'
  | 'legal'
  | 'hr'
  | 'engineering'
  | 'sales'
  | 'operations'
  | 'marketing';

export type ApproachId = 'process' | 'buy' | 'rag' | 'agentic' | 'finetune' | 'predictive';

export type StakeholderId = 'ceo' | 'cfo' | 'ciso' | 'coo' | 'chro' | 'cto';

export type PolicyId = 'aup' | 'catalog' | 'review_board' | 'evals' | 'privacy' | 'bias_audit';

export type InitiativeId = 'literacy' | 'townhall' | 'demoday' | 'expectations' | 'hire' | 'kpi';

export type ScenarioId = 'lumen' | 'pemberton' | 'crestline';

export type Fit = 'ideal' | 'acceptable' | 'poor';

export type Verdict = 'great' | 'good' | 'mixed' | 'bad';

export type ProjectStage = 'pilot' | 'results' | 'production' | 'killed' | 'retired';

export type PilotResult = 'success' | 'mixed' | 'failed';

export type Phase = 'planning' | 'report' | 'event' | 'ended';

export type Tone = 'positive' | 'negative' | 'neutral';

export type LessonCategory = 'discovery' | 'build-buy' | 'governance' | 'change' | 'roi';

export interface Project {
  id: string;
  useCaseId: string;
  approach: ApproachId;
  stage: ProjectStage;
  startedQuarter: number;
  /** Quarters left until pilot results are available (pilot stage only). */
  quartersRemaining: number;
  iterations: number;
  result: PilotResult | null;
  resultsQuarter: number | null;
  /** Full quarters a project has sat in "results" without a decision. */
  stalledQuarters: number;
  productionQuarter: number | null;
  /** 0–100: share of intended users actually using it. */
  adoption: number;
  /** Human-in-the-loop review on outputs/actions. */
  hitl: boolean;
  valueRealized: number;
  spend: number;
  debriefId: string | null;
  endedQuarter: number | null;
}

export interface DepartmentState {
  audited: boolean;
  /** 0–100: how clean, accessible and documented the department's data is. */
  dataReadiness: number;
  champions: boolean;
}

export interface Debrief {
  id: string;
  quarter: number;
  kind: 'pilot' | 'event' | 'decision';
  verdict: Verdict;
  title: string;
  /** What you did. */
  summary: string;
  /** Why it worked or failed. */
  insight: string;
  /** Real-world parallel, when there is one. */
  realWorld?: string;
  lessonId?: string;
}

export interface InboxMessage {
  id: string;
  quarter: number;
  stakeholder: StakeholderId;
  text: string;
  tone: Tone;
}

export interface QuarterSnapshot {
  quarter: number;
  budget: number;
  runRate: number;
  expected: number;
  adoption: number;
  risk: number;
  trust: number;
  morale: number;
  cumulativeValue: number;
  cumulativeSpend: number;
}

export interface TrustFactor {
  label: string;
  delta: number;
}

export interface QuarterReport {
  quarter: number;
  valueThisQuarter: number;
  perceivedValue: number;
  measured: boolean;
  expected: number;
  runCosts: number;
  allocation: number;
  trustBefore: number;
  trustAfter: number;
  factors: TrustFactor[];
  completedPilots: string[];
  risk: number;
  adoption: number;
  verdict: Verdict;
  headline: string;
  boardQuote: string;
  outcome: 'continue' | 'fired' | 'completed';
}

export interface GameStats {
  audits: number;
  pilotsLaunched: number;
  idealPicks: number;
  acceptablePicks: number;
  poorPicks: number;
  processFixes: number;
  buildPicks: number;
  buyPicks: number;
  agenticPicks: number;
  scaled: number;
  killed: number;
  killedSmart: number;
  killedWinners: number;
  retired: number;
  iterations: number;
  demoDays: number;
  expectationResets: number;
  incidents: number;
  eventsGreat: number;
  eventsBad: number;
  maxPurgatory: number;
  purgatoryQuarters: number;
  hitlOnSensitive: number;
  hitlOffSensitive: number;
  peakRisk: number;
  changeActions: number;
}

export interface GameState {
  version: number;
  seed: number;
  rng: number;
  scenarioId: ScenarioId;
  playerName: string;

  quarter: number;
  maxQuarters: number;
  phase: Phase;

  capacityUsed: number;
  /** Temporary capacity modifier for the current quarter (can be negative). */
  capacityBonus: number;
  hires: number;

  budget: number;
  trust: number;
  morale: number;
  /** Executive hype multiplier applied to the board's value expectations. */
  hype: number;
  /** Baseline risk exposure (shadow AI, vendor terms, etc.) before project risk. */
  riskBase: number;

  cumulativeValue: number;
  cumulativeSpend: number;

  departments: Record<DeptId, DepartmentState>;
  projects: Project[];
  stakeholders: Record<StakeholderId, number>;
  policies: PolicyId[];

  literacy: number;
  kpiDashboard: boolean;
  lastTownHall: number | null;

  flags: Record<string, number | boolean>;
  pendingEvents: string[];
  seenEvents: string[];

  history: QuarterSnapshot[];
  lastReport: QuarterReport | null;
  debriefs: Debrief[];
  lessons: string[];
  inbox: InboxMessage[];
  stats: GameStats;

  outcome: 'fired' | 'completed' | null;
  nextId: number;
}

export type GameAction =
  | { type: 'audit'; dept: DeptId }
  | { type: 'launchPilot'; useCaseId: string; approach: ApproachId }
  | { type: 'iterate'; projectId: string }
  | { type: 'scale'; projectId: string; hitl: boolean }
  | { type: 'kill'; projectId: string }
  | { type: 'retire'; projectId: string }
  | { type: 'toggleHitl'; projectId: string }
  | { type: 'dataSprint'; dept: DeptId }
  | { type: 'champions'; dept: DeptId }
  | { type: 'policy'; policy: PolicyId }
  | { type: 'initiative'; initiative: InitiativeId };

export interface ActionCost {
  capacity: number;
  budget: number;
}
