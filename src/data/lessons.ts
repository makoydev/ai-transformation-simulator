import type { LessonCategory } from '@/engine/types';
import { PALETTE } from '@/lib/palette';

export interface LessonDef {
  id: string;
  category: LessonCategory;
  title: string;
  principle: string;
  detail: string;
}

export const LESSON_CATEGORIES: Record<LessonCategory, { label: string; color: string }> = {
  discovery: { label: 'Discovery & Triage', color: PALETTE.hue.sky },
  'build-buy': { label: 'Build vs. Buy', color: PALETTE.hue.violet },
  governance: { label: 'Governance & Risk', color: PALETTE.hue.rose },
  change: { label: 'Change & Adoption', color: PALETTE.hue.pink },
  roi: { label: 'ROI & Portfolio', color: PALETTE.hue.amber },
};

export const LESSONS: LessonDef[] = [
  // ── Discovery & Triage ──
  {
    id: 'discovery-first',
    category: 'discovery',
    title: 'Discovery Before Solutions',
    principle: 'Start with the problem inventory, not the technology.',
    detail:
      'Interview departments, map workflows, and measure where time and money actually leak. The best AI leaders spend their first 90 days listening, because the highest-value use cases are rarely the ones executives pitch first.',
  },
  {
    id: 'process-before-ai',
    category: 'discovery',
    title: "Don't Automate the Mess",
    principle: 'If the root cause is the process, fix the process.',
    detail:
      'Many "AI opportunities" are really approval chains, duplicated forms, or outdated policies. Removing a step is cheaper, faster, and lower-risk than adding a model on top of a broken workflow.',
  },
  {
    id: 'data-readiness',
    category: 'discovery',
    title: 'Data Readiness Is the Real Project',
    principle: 'Most AI projects that fail, fail on data, not models.',
    detail:
      'Assess data quality, access, and ownership before you commit to a pilot. Scanned PDFs, duplicate CRM records, and undocumented spreadsheets quietly turn a 2-quarter pilot into a 6-quarter one.',
  },
  {
    id: 'use-case-fit',
    category: 'discovery',
    title: 'Match the Tool to the Shape of the Problem',
    principle: 'Language problems, prediction problems, and process problems need different tools.',
    detail:
      'Ask: Is the output text, a number, or an action? Does the knowledge live in documents or in structured data? Is it multi-step? The answers point to RAG, predictive ML, agents, or no AI at all.',
  },
  {
    id: 'quick-wins',
    category: 'discovery',
    title: 'Quick Wins Buy Patience',
    principle: 'Visible, low-risk early wins fund the hard, high-value bets.',
    detail:
      'An internal helpdesk assistant that every employee touches does more for your credibility than a moonshot that ships in two years. Sequence your portfolio so trust compounds.',
  },
  {
    id: 'data-product',
    category: 'discovery',
    title: 'Fix Data Use Case by Use Case',
    principle: 'Build data products for specific use cases, not a big-bang data lake.',
    detail:
      'Multi-year "single source of truth" programs routinely stall before delivering value. Improving the specific data a high-value use case needs ships value now and builds the platform incrementally.',
  },

  // ── Build vs. Buy ──
  {
    id: 'buy-commodity',
    category: 'build-buy',
    title: 'Buy Commodity, Build Differentiators',
    principle: "Don't build what you can buy, and don't buy what makes you unique.",
    detail:
      'Invoice extraction, meeting notes, and coding assistants are commodities: vendors will out-invest you. Reserve scarce engineering capacity for problems where your data, workflows, or customers create an edge.',
  },
  {
    id: 'rag-for-knowledge',
    category: 'build-buy',
    title: 'RAG for Knowledge Work',
    principle: 'When the answer lives in documents, retrieve it; don\'t memorize it.',
    detail:
      'Retrieval-Augmented Generation grounds answers in your current documents with citations users can check. It updates when the documents do, which no amount of training can match.',
  },
  {
    id: 'rag-vs-finetune',
    category: 'build-buy',
    title: 'Fine-Tuning Teaches Form, Not Facts',
    principle: 'Use RAG for knowledge. Use fine-tuning for behavior, style, and format.',
    detail:
      'Fine-tuning does not reliably inject new facts, and whatever it learns goes stale. Retrieval keeps facts fresh and auditable. Many production systems combine both: RAG for content, light tuning for format.',
  },
  {
    id: 'when-to-finetune',
    category: 'build-buy',
    title: 'When Fine-Tuning Earns Its Keep',
    principle: 'Narrow task + huge volume + strict format + thousands of good examples.',
    detail:
      'Fine-tuning a smaller model can match a larger model on a narrow task at a fraction of the cost and latency. Without that combination, prompting and retrieval usually win.',
  },
  {
    id: 'predictive-not-genai',
    category: 'build-buy',
    title: 'Not Everything Is a GenAI Problem',
    principle: 'Forecasts, scores, and classifications belong to classic ML.',
    detail:
      'Predictive models on structured data are cheaper, faster, more accurate, and easier to validate for numeric problems. "AI strategy" includes the boring, proven techniques.',
  },
  {
    id: 'simplest-thing',
    category: 'build-buy',
    title: 'Use the Simplest Thing That Works',
    principle: 'Autonomy is a cost, not a feature.',
    detail:
      'Every step up the ladder (rules → ML → RAG → agents) adds cost, latency, risk, and maintenance. Climb only as high as the problem requires.',
  },
  {
    id: 'vendor-bakeoff',
    category: 'build-buy',
    title: 'Demos Lie, Bake-Offs Don\'t',
    principle: 'Evaluate vendors on your own data with pre-defined success criteria.',
    detail:
      'Vendor demos are curated. Run time-boxed bake-offs against your real edge cases, define measurable acceptance criteria up front, and negotiate exit clauses before multi-year commitments.',
  },
  {
    id: 'evals-portability',
    category: 'build-buy',
    title: 'Evals Make Models Swappable',
    principle: 'A regression test set lets you adopt better, cheaper models safely.',
    detail:
      'Model capability rises and per-token prices fall quickly. Teams with automated evaluation suites can switch models in days; teams without them either stay stuck or ship silent regressions.',
  },
  {
    id: 'outsourced-strategy',
    category: 'build-buy',
    title: 'Strategy Is What You Ship',
    principle: "You can't outsource your AI strategy to a slide deck.",
    detail:
      'Consultants can accelerate specific hard problems, but a transformation strategy is the sum of decisions you make and ship. Scope external help narrowly and transfer the knowledge in-house.',
  },

  // ── Governance & Risk ──
  {
    id: 'shadow-ai',
    category: 'governance',
    title: 'Shadow AI Means Unmet Demand',
    principle: 'Banning AI drives it underground. Sanctioned tools bring it into the light.',
    detail:
      'Employees use unapproved AI because it helps them. Pair a clear acceptable-use policy with a safe, approved enterprise tool, and offer amnesty so people tell you what they actually use.',
  },
  {
    id: 'you-own-outputs',
    category: 'governance',
    title: 'You Own What Your AI Says',
    principle: "Your AI's outputs are your company's statements.",
    detail:
      'Courts and regulators treat chatbot answers as the company speaking. Ground customer-facing systems in authoritative sources, show citations, and design for graceful failure.',
  },
  {
    id: 'hitl',
    category: 'governance',
    title: 'Human-in-the-Loop Where Stakes Are High',
    principle: 'Match the level of human oversight to the cost of an error.',
    detail:
      'Use HITL for decisions that are high-stakes, irreversible, or regulated, and let low-risk tasks run autonomously. Oversight costs efficiency, so spend it where it counts.',
  },
  {
    id: 'agents-need-guardrails',
    category: 'governance',
    title: 'Agents Need Least Privilege',
    principle: 'Give agents the minimum permissions, reversible actions, and human checkpoints.',
    detail:
      'Agents act, so their mistakes are actions, not just words. Scope tool access, cap spend, log everything, require approval for irreversible steps, and treat every external input as potentially hostile.',
  },
  {
    id: 'bias-history',
    category: 'governance',
    title: 'Historical Data Encodes Historical Bias',
    principle: 'A model trained on past decisions will repeat past mistakes at scale.',
    detail:
      'Audit models that affect people (hiring, lending, insurance) for disparate impact before and after launch. Keep humans accountable for decisions and be able to explain them.',
  },
  {
    id: 'inventory',
    category: 'governance',
    title: "You Can't Govern What You Can't See",
    principle: 'Maintain an inventory of every AI system, its owner, and its risk tier.',
    detail:
      'Regulations like the EU AI Act require documentation, risk management, and human oversight for high-risk systems. A living model inventory turns a regulator request from a crisis into an email.',
  },
  {
    id: 'read-the-tos',
    category: 'governance',
    title: 'Read the Data Terms',
    principle: 'Know where your prompts go, how long they stay, and who trains on them.',
    detail:
      'Insist on enterprise agreements with zero or limited data retention and no training on your data, and add PII redaction for sensitive workloads.',
  },
  {
    id: 'red-team',
    category: 'governance',
    title: 'Red-Team Before the Internet Does',
    principle: 'Attack your own systems before customers and journalists do.',
    detail:
      'Adversarial testing for jailbreaks, prompt injection, and off-brand behavior is cheap insurance. Public chatbot failures are usually discovered by bored users, not sophisticated attackers.',
  },
  {
    id: 'ai-finops',
    category: 'governance',
    title: 'AI FinOps: Meter Everything',
    principle: 'Usage-based AI costs need budgets, limits, and observability.',
    detail:
      'Agent loops, verbose prompts, and unbounded retries can turn a pilot into a five-figure surprise. Set per-workflow budgets, rate limits, and alerts from day one.',
  },
  {
    id: 'garbage-in',
    category: 'governance',
    title: 'Content Governance Is AI Governance',
    principle: 'A RAG system is only as trustworthy as the documents behind it.',
    detail:
      'Assign owners to source content, archive superseded versions, and set review cycles. Stale documents create confident, well-cited, wrong answers.',
  },

  // ── Change & Adoption ──
  {
    id: 'fear-kills-adoption',
    category: 'change',
    title: 'Fear Kills Adoption',
    principle: 'People will not adopt tools they believe are designed to replace them.',
    detail:
      'Be honest and specific about workforce impact, commit to reskilling and redeployment where you can, and involve frontline teams in design. Silence is filled with the worst rumor available.',
  },
  {
    id: 'licenses-not-adoption',
    category: 'change',
    title: 'Licenses Are Not Adoption',
    principle: 'Deployed is not the same as used.',
    detail:
      'Seat counts are vanity metrics. Track weekly active use and outcome metrics, and invest in role-specific training, prompt libraries, and champions who show peers what good looks like.',
  },
  {
    id: 'grassroots',
    category: 'change',
    title: 'Champions Beat Mandates',
    principle: 'Peer champions spread adoption faster than executive memos.',
    detail:
      'Find the people already experimenting, give them recognition and a network, and turn their workflows into shared playbooks. Adoption is social.',
  },
  {
    id: 'human-handoff',
    category: 'change',
    title: 'Always Offer a Human Exit',
    principle: 'Automation should make humans available for the hard cases, not unreachable.',
    detail:
      'Customer-facing AI needs a clear, fast path to a person. Over-automation trades short-term savings for long-term trust and satisfaction.',
  },
  {
    id: 'talent',
    category: 'change',
    title: 'Capacity Is a Strategy Decision',
    principle: 'Your team\'s capacity caps how much you can transform.',
    detail:
      'Hiring, upskilling, and retaining AI talent determines how many initiatives you can actually run. Watch the bus factor: knowledge concentrated in one engineer is a single point of failure.',
  },
  {
    id: 'literacy',
    category: 'change',
    title: 'AI Literacy Is Infrastructure',
    principle: 'Company-wide training multiplies the value of every AI project.',
    detail:
      'Employees who understand what AI is good at, and where it fails, use it more, use it safely, and suggest better use cases. Treat literacy like infrastructure, not a one-off workshop.',
  },

  // ── ROI & Portfolio ──
  {
    id: 'portfolio',
    category: 'roi',
    title: 'Manage a Portfolio, Not a Moonshot',
    principle: 'Balance quick wins, scalable bets, and a few big swings.',
    detail:
      'A disciplined portfolio with stage gates and clear kill criteria survives individual failures. Betting everything on one transformational project makes your career a coin flip.',
  },
  {
    id: 'hype-debt',
    category: 'roi',
    title: 'Hype Is Debt',
    principle: 'Every overpromise is a loan against future credibility.',
    detail:
      'Flashy demos and "AI everywhere" pledges raise expectations faster than value can grow. Set expectations you can beat, then beat them.',
  },
  {
    id: 'kill-fast',
    category: 'roi',
    title: 'Kill Pilots Early and Proudly',
    principle: 'Stopping a failing experiment is a success, not a failure.',
    detail:
      'Define kill criteria before a pilot starts. Reallocating budget from weak pilots to strong ones is how portfolios outperform, and it shows the board you are disciplined with their money.',
  },
  {
    id: 'poc-purgatory',
    category: 'roi',
    title: 'Escape PoC Purgatory',
    principle: 'A pilot without a production decision is a cost without a return.',
    detail:
      'Many companies run dozens of pilots that never scale. Set a decision date for every pilot: scale it, iterate with a clear hypothesis, or kill it.',
  },
  {
    id: 'measure-to-defend',
    category: 'roi',
    title: 'Measure Value or Lose It',
    principle: "Value the board can't see doesn't exist.",
    detail:
      'Capture baselines before you launch and track business KPIs (cycle time, cost per ticket, revenue), not model metrics. Measured ROI is what protects your budget when the cuts come.',
  },
];

export const LESSON_MAP: Record<string, LessonDef> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
