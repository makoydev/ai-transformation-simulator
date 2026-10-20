import type { ApproachId } from '@/engine/types';
import { PALETTE } from '@/lib/palette';

export interface ApproachDef {
  id: ApproachId;
  name: string;
  short: string;
  category: 'no-ai' | 'buy' | 'build';
  tagline: string;
  description: string;
  bestFor: string;
  watchOut: string;
  /** $M, multiplied by the use case's scale. */
  pilotCost: number;
  pilotQuarters: number;
  prodCost: number;
  /** $M per quarter in production (licenses, inference, maintenance). */
  runCost: number;
  /** 0–1 relative blast radius when things go wrong. */
  riskWeight: number;
  /** How much of a use case's data requirement this approach actually needs. */
  dataMult: number;
  /** Adoption % on day one of production. */
  startAdoption: number;
  color: string;
}

export const APPROACHES: Record<ApproachId, ApproachDef> = {
  process: {
    id: 'process',
    name: 'Process Redesign',
    short: 'Process',
    category: 'no-ai',
    tagline: 'Fix the workflow, not the model',
    description:
      'Remove steps, clarify ownership, change the policy, or switch on a rule-based feature you already own. No model required.',
    bestFor: 'Bottlenecks caused by approvals, hand-offs, duplicated forms, or outdated policy.',
    watchOut: 'Unglamorous. Executives may not count it as "AI", even when it delivers the most value.',
    pilotCost: 0.12,
    pilotQuarters: 1,
    prodCost: 0.08,
    runCost: 0,
    riskWeight: 0,
    dataMult: 0,
    startAdoption: 55,
    color: PALETTE.hue.slate,
  },
  buy: {
    id: 'buy',
    name: 'Buy: Vendor AI / Copilot',
    short: 'Buy',
    category: 'buy',
    tagline: 'License a mature product',
    description:
      'Buy a proven AI product or switch on AI features inside platforms you already use (CRM, ERP, helpdesk, IDE).',
    bestFor: 'Commodity capabilities: coding assistants, meeting notes, document extraction, CRM summaries.',
    watchOut: 'Licenses are not adoption. Check data-usage terms and avoid lock-in.',
    pilotCost: 0.25,
    pilotQuarters: 1,
    prodCost: 0.35,
    runCost: 0.12,
    riskWeight: 0.35,
    dataMult: 0.3,
    startAdoption: 20,
    color: PALETTE.hue.green,
  },
  rag: {
    id: 'rag',
    name: 'RAG Assistant',
    short: 'RAG',
    category: 'build',
    tagline: 'Ground answers in your documents',
    description:
      'Retrieval-Augmented Generation: search your own documents at query time and have the model answer with citations.',
    bestFor: 'Knowledge-heavy Q&A over policies, manuals, contracts, and product documentation.',
    watchOut: 'Only as good as your content. Stale or duplicated docs produce confident wrong answers.',
    pilotCost: 0.55,
    pilotQuarters: 2,
    prodCost: 0.5,
    runCost: 0.08,
    riskWeight: 0.55,
    dataMult: 0.9,
    startAdoption: 25,
    color: PALETTE.hue.sky,
  },
  agentic: {
    id: 'agentic',
    name: 'Agentic Workflow',
    short: 'Agentic',
    category: 'build',
    tagline: 'AI that plans and takes actions',
    description:
      'LLM agents that plan multi-step work and act across systems through tools and APIs, with humans supervising.',
    bestFor: 'High-volume, multi-step workflows with clear playbooks and reversible actions.',
    watchOut: 'Highest upside, biggest blast radius. Needs least-privilege tools, HITL, and cost monitoring.',
    pilotCost: 0.95,
    pilotQuarters: 2,
    prodCost: 0.9,
    runCost: 0.18,
    riskWeight: 1,
    dataMult: 0.8,
    startAdoption: 22,
    color: PALETTE.hue.violet,
  },
  finetune: {
    id: 'finetune',
    name: 'Fine-Tuned Model',
    short: 'Fine-tune',
    category: 'build',
    tagline: 'Train a model on your examples',
    description:
      'Fine-tune a (usually smaller) model on thousands of your own examples to master a narrow task, format, or voice.',
    bestFor: 'High-volume, narrow, consistent-format tasks with thousands of high-quality examples.',
    watchOut: "Teaches style and format, not reliable facts. Costly to build, evaluate, and retrain.",
    pilotCost: 1.3,
    pilotQuarters: 3,
    prodCost: 0.6,
    runCost: 0.05,
    riskWeight: 0.6,
    dataMult: 1.2,
    startAdoption: 25,
    color: PALETTE.hue.pink,
  },
  predictive: {
    id: 'predictive',
    name: 'Predictive ML',
    short: 'Predictive',
    category: 'build',
    tagline: 'Classic ML on structured data',
    description:
      'Traditional machine learning such as forecasting, classification, scoring, and anomaly detection on historical, structured data.',
    bestFor: 'Numbers and patterns: demand forecasts, routing, lead scoring, fraud detection.',
    watchOut: 'Needs clean historical data, and can faithfully learn historical bias.',
    pilotCost: 0.65,
    pilotQuarters: 2,
    prodCost: 0.5,
    runCost: 0.05,
    riskWeight: 0.45,
    dataMult: 1,
    startAdoption: 30,
    color: PALETTE.hue.amber,
  },
};

export const APPROACH_ORDER: ApproachId[] = ['process', 'buy', 'rag', 'agentic', 'finetune', 'predictive'];

export const GENERATIVE: ApproachId[] = ['buy', 'rag', 'agentic', 'finetune'];
export const BUILD: ApproachId[] = ['rag', 'agentic', 'finetune', 'predictive'];
