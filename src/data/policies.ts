import type { InitiativeId, PolicyId, StakeholderId } from '@/engine/types';

export interface PolicyDef {
  id: PolicyId;
  name: string;
  description: string;
  benefit: string;
  tradeoff: string;
  cost: number;
  upkeep: number;
  riskBase: number;
  morale: number;
  stakeholders: Partial<Record<StakeholderId, number>>;
  lessonId: string;
}

export const POLICIES: Record<PolicyId, PolicyDef> = {
  aup: {
    id: 'aup',
    name: 'AI Acceptable Use Policy',
    description: 'Clear rules on which data can go into which AI tools, and who is accountable for AI outputs.',
    benefit: 'Baseline risk −5. Slows Shadow AI growth.',
    tradeoff: 'A policy without an approved tool alternative mostly gets ignored.',
    cost: 0.1,
    upkeep: 0,
    riskBase: -5,
    morale: -1,
    stakeholders: { ciso: 6 },
    lessonId: 'shadow-ai',
  },
  catalog: {
    id: 'catalog',
    name: 'Sanctioned AI Tool Catalog',
    description: 'Roll out an approved enterprise AI assistant with proper data terms to every employee.',
    benefit: 'Baseline risk −10, stops Shadow AI growth, boosts adoption of bought tools, morale +4.',
    tradeoff: '$80K per quarter in licenses.',
    cost: 0.4,
    upkeep: 0.08,
    riskBase: -10,
    morale: 4,
    stakeholders: { ciso: 4, chro: 3 },
    lessonId: 'shadow-ai',
  },
  review_board: {
    id: 'review_board',
    name: 'AI Review Board & Model Inventory',
    description: 'Register every AI system with an owner, a risk tier, and documentation.',
    benefit: 'Reduces risk on every project by 12%. Makes regulator inquiries painless.',
    tradeoff: 'The CTO will call it bureaucracy.',
    cost: 0.2,
    upkeep: 0,
    riskBase: 0,
    morale: 0,
    stakeholders: { ciso: 8, cto: -4 },
    lessonId: 'inventory',
  },
  evals: {
    id: 'evals',
    name: 'Evaluation & Red-Teaming Harness',
    description: 'Automated test sets, regression evals, and adversarial testing for every generative system.',
    benefit: '+8% pilot success. Cuts RAG/agent/fine-tune risk by 18%.',
    tradeoff: 'Real engineering investment with no visible feature.',
    cost: 0.45,
    upkeep: 0,
    riskBase: 0,
    morale: 0,
    stakeholders: { cto: 6, ciso: 4 },
    lessonId: 'red-team',
  },
  privacy: {
    id: 'privacy',
    name: 'PII Redaction & Privacy Gateway',
    description: 'A gateway that redacts personal data and enforces zero-retention terms on every model call.',
    benefit: 'Baseline risk −3. Cuts risk on sensitive use cases by 15%.',
    tradeoff: 'Adds latency and integration work.',
    cost: 0.4,
    upkeep: 0,
    riskBase: -3,
    morale: 0,
    stakeholders: { ciso: 8 },
    lessonId: 'read-the-tos',
  },
  bias_audit: {
    id: 'bias_audit',
    name: 'Responsible AI & Bias Audits',
    description: 'Independent fairness testing and explainability for any system that affects people.',
    benefit: 'Cuts risk on people-impacting systems by 25%.',
    tradeoff: 'Audits sometimes say things you don\'t want to hear.',
    cost: 0.3,
    upkeep: 0,
    riskBase: 0,
    morale: 1,
    stakeholders: { chro: 6, ciso: 3 },
    lessonId: 'bias-history',
  },
};

export const POLICY_ORDER: PolicyId[] = ['aup', 'catalog', 'review_board', 'evals', 'privacy', 'bias_audit'];

export interface InitiativeDef {
  id: InitiativeId;
  name: string;
  group: 'change' | 'board' | 'team';
  description: string;
  benefit: string;
  tradeoff: string;
  stakeholders: Partial<Record<StakeholderId, number>>;
  lessonId: string;
}

export const INITIATIVES: Record<InitiativeId, InitiativeDef> = {
  literacy: {
    id: 'literacy',
    name: 'AI Literacy Academy',
    group: 'change',
    description: 'Role-based AI training for every employee, from the warehouse floor to the boardroom.',
    benefit: 'Morale +5. Every production project gains +4 adoption per quarter per level (max 3).',
    tradeoff: 'Gets more expensive at each level. Value shows up slowly.',
    stakeholders: { chro: 5 },
    lessonId: 'literacy',
  },
  townhall: {
    id: 'townhall',
    name: 'All-Hands Town Hall',
    group: 'change',
    description: 'Explain the AI plan honestly: what changes, what doesn\'t, and what happens to jobs.',
    benefit: 'Morale +10 (only +3 if you held one last quarter).',
    tradeoff: 'Diminishing returns if overused.',
    stakeholders: { chro: 4 },
    lessonId: 'fear-kills-adoption',
  },
  demoday: {
    id: 'demoday',
    name: 'Executive Demo Day',
    group: 'board',
    description: 'A polished showcase of AI prototypes for the CEO and board.',
    benefit: 'Board trust +6, CEO +10.',
    tradeoff: 'Executive hype +15%, so the board expects more value every quarter.',
    stakeholders: { ceo: 10, cfo: -2 },
    lessonId: 'hype-debt',
  },
  expectations: {
    id: 'expectations',
    name: 'Reset Expectations Briefing',
    group: 'board',
    description: 'Walk the board through realistic adoption curves and time-to-value.',
    benefit: 'Executive hype −15%: value targets drop. CFO +6.',
    tradeoff: 'Board trust −2 now. The CEO hates it.',
    stakeholders: { cfo: 6, ceo: -8 },
    lessonId: 'hype-debt',
  },
  kpi: {
    id: 'kpi',
    name: 'Baselines & KPI Dashboard',
    group: 'board',
    description: 'Measure baselines before launch and track business KPIs, not model metrics.',
    benefit: 'The board credits 100% of delivered value (instead of 65%). CFO +10.',
    tradeoff: 'One-time investment. Exposes weak projects too.',
    stakeholders: { cfo: 10 },
    lessonId: 'measure-to-defend',
  },
  hire: {
    id: 'hire',
    name: 'Hire an AI Engineering Squad',
    group: 'team',
    description: 'Add a squad of ML and platform engineers to your team (max 3 squads).',
    benefit: '+1 team capacity every quarter, starting next quarter.',
    tradeoff: '$220K per quarter in salaries, forever.',
    stakeholders: { cto: 6, cfo: -2 },
    lessonId: 'talent',
  },
};

export const INITIATIVE_ORDER: InitiativeId[] = ['literacy', 'townhall', 'kpi', 'demoday', 'expectations', 'hire'];
