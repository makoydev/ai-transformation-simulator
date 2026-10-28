/**
 * End-of-game scorecard: a 1,000-point score, a letter grade, a leadership
 * archetype derived from play style, and achievement badges.
 */
import { BALANCE } from './balance';
import {
  avgAdoption,
  clamp,
  productionProjects,
  roi,
  scenarioOf,
  totalRisk,
} from './selectors';
import type { GameState } from './types';

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreLine {
  key: string;
  label: string;
  points: number;
  max: number;
  detail: string;
}

export interface FinalScore {
  total: number;
  grade: Grade;
  lines: ScoreLine[];
  fired: boolean;
}

const GRADE_THRESHOLDS: [Grade, number][] = [
  ['S', 850],
  ['A', 720],
  ['B', 580],
  ['C', 440],
  ['D', 300],
];

export function gradeFor(total: number, fired: boolean): Grade {
  for (const [grade, min] of GRADE_THRESHOLDS) {
    if (total >= min) {
      if (fired && (grade === 'S' || grade === 'A' || grade === 'B' || grade === 'C')) return 'D';
      return grade;
    }
  }
  return 'F';
}

export function computeFinalScore(s: GameState): FinalScore {
  const sc = scenarioOf(s);
  const prod = productionProjects(s);
  const adoption = avgAdoption(s);
  const risk = totalRisk(s);
  const r = roi(s);

  const lines: ScoreLine[] = [
    {
      key: 'value',
      label: 'Value delivered',
      max: 300,
      points: Math.round(clamp(s.cumulativeValue / sc.valueTarget, 0, 1) * 300),
      detail: `$${s.cumulativeValue.toFixed(2)}M of a $${sc.valueTarget}M ambition`,
    },
    {
      key: 'roi',
      label: 'Return on investment',
      max: 150,
      points: Math.round(clamp((r - 0.4) / 1.4, 0, 1) * 150),
      detail: `${r.toFixed(2)}x return on $${s.cumulativeSpend.toFixed(2)}M spent`,
    },
    {
      key: 'adoption',
      label: 'Adoption at scale',
      max: 150,
      points: Math.round((adoption / 100) * clamp(prod.length / 5, 0, 1) * 150),
      detail: `${Math.round(adoption)}% average adoption across ${prod.length} live system${prod.length === 1 ? '' : 's'}`,
    },
    {
      key: 'risk',
      label: 'Risk management',
      max: 150,
      points: Math.round(clamp((75 - risk) / 55, 0, 1) * 150),
      detail: `Final risk exposure ${Math.round(risk)}/100, ${s.stats.incidents} incident${s.stats.incidents === 1 ? '' : 's'}`,
    },
    {
      key: 'trust',
      label: 'Board trust',
      max: 150,
      points: Math.round(clamp((s.trust - BALANCE.fireThreshold) / 70, 0, 1) * 150),
      detail: `${s.trust}/100 board trust`,
    },
    {
      key: 'morale',
      label: 'Workforce morale',
      max: 100,
      points: Math.round(clamp((s.morale - 20) / 60, 0, 1) * 100),
      detail: `${s.morale}/100 employee sentiment`,
    },
  ];

  const fired = s.outcome === 'fired';
  const raw = lines.reduce((sum, l) => sum + l.points, 0);
  const total = fired ? Math.round(raw * 0.6) : raw;
  return { total, grade: gradeFor(total, fired), lines, fired };
}

export interface Archetype {
  id: string;
  name: string;
  tagline: string;
  description: string;
  strength: string;
  blindSpot: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  architect: {
    id: 'architect',
    name: 'The Transformation Architect',
    tagline: 'Value, adoption, and governance, all at once.',
    description:
      'You treated AI as an operating-model change, not a technology project. You matched tools to problems, governed risk before it bit, invested in people, and proved value in the board\'s language.',
    strength: 'Balancing speed, safety, and adoption without dropping any of them.',
    blindSpot: 'Success raises the bar. The next board will expect you to do it again, faster.',
  },
  operator: {
    id: 'operator',
    name: 'The Pragmatic Operator',
    tagline: 'Fix the process. Then add the AI.',
    description:
      'You knew that many "AI problems" are really process problems, and you shipped cheap, fast wins that compounded into real ROI.',
    strength: 'Ruthless focus on root causes and payback.',
    blindSpot: 'Pragmatism can underinvest in the bigger, differentiating bets.',
  },
  whisperer: {
    id: 'whisperer',
    name: 'The Change Whisperer',
    tagline: 'People first, and the technology follows.',
    description:
      'You understood that adoption, not deployment, creates value. Training, champions, and honest communication made your workforce pull AI in rather than push back.',
    strength: 'Turning fear into curiosity and curiosity into habits.',
    blindSpot: 'Great adoption of modest use cases still caps total value.',
  },
  hawk: {
    id: 'hawk',
    name: 'The Governance Hawk',
    tagline: 'Nothing bad happened. Not much else did, either.',
    description:
      'Your policies were impeccable and your risk exposure was tiny, but the business saw little value. Governance is an enabler, not a destination.',
    strength: 'Regulators and the CISO adore you.',
    blindSpot: 'Risk avoided is not value created. Guardrails exist so you can drive faster.',
  },
  collector: {
    id: 'collector',
    name: 'The PoC Collector',
    tagline: 'So many pilots. So little production.',
    description:
      'You launched experiments everywhere but struggled to make scale-or-kill decisions. That is the most common failure pattern in enterprise AI.',
    strength: 'Curiosity and breadth of exploration.',
    blindSpot: 'Pilots without production decisions are costs without returns.',
  },
  hype: {
    id: 'hype',
    name: 'The Hype Merchant',
    tagline: 'Amazing demos. Awkward board meetings.',
    description:
      'You were brilliant at generating excitement, but every demo raised expectations faster than value could grow. Hype is debt, and the board came to collect.',
    strength: 'Storytelling and executive energy.',
    blindSpot: 'Promises compound faster than adoption curves.',
  },
  cowboy: {
    id: 'cowboy',
    name: 'The Cowboy Builder',
    tagline: 'Move fast and break compliance.',
    description:
      'You shipped ambitious systems quickly, with too little oversight. Incidents and risk exposure became the story instead of the value.',
    strength: 'Bias for action and real technical ambition.',
    blindSpot: 'Blast radius. Human-in-the-loop and governance are what let you keep shipping.',
  },
  steady: {
    id: 'steady',
    name: 'The Steady Hand',
    tagline: 'Solid, sensible, survivable.',
    description:
      'You avoided the big mistakes and made steady progress. With sharper triage and stronger adoption plays, steady can become exceptional.',
    strength: 'Consistency and judgment under pressure.',
    blindSpot: 'Playing not to lose isn\'t the same as playing to win.',
  },
};

export function determineArchetype(s: GameState, score: FinalScore): Archetype {
  const st = s.stats;
  const prod = productionProjects(s).length;
  if (st.peakRisk >= 65 || st.incidents >= 3 || st.hitlOffSensitive >= 2) return ARCHETYPES.cowboy;
  if (st.demoDays >= 2 || s.hype >= 1.3) return ARCHETYPES.hype;
  if ((st.pilotsLaunched >= 6 && st.scaled <= 2) || st.maxPurgatory >= 3) return ARCHETYPES.collector;
  if (s.policies.length >= 5 && prod <= 2) return ARCHETYPES.hawk;
  if (score.grade === 'S' || score.grade === 'A') return ARCHETYPES.architect;
  if (st.processFixes >= 2 && roi(s) >= 1) return ARCHETYPES.operator;
  if (s.morale >= 65 && avgAdoption(s) >= 55 && prod >= 3) return ARCHETYPES.whisperer;
  return ARCHETYPES.steady;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export function computeBadges(s: GameState): Badge[] {
  const st = s.stats;
  const championDepts = Object.values(s.departments).filter((d) => d.champions).length;
  return [
    {
      id: 'right-tool',
      name: 'Right Tool, Right Job',
      description: 'Picked the ideal approach for 5+ use cases.',
      earned: st.idealPicks >= 5,
    },
    {
      id: 'process-first',
      name: "Don't Automate the Mess",
      description: 'Launched 2+ process redesigns.',
      earned: st.processFixes >= 2,
    },
    {
      id: 'kill-switch',
      name: 'Kill Switch',
      description: 'Killed a pilot for the right reasons.',
      earned: st.killedSmart >= 1,
    },
    {
      id: 'purgatory-free',
      name: 'Purgatory Escape Artist',
      description: 'Never left a pilot undecided (with 3+ pilots launched).',
      earned: st.purgatoryQuarters === 0 && st.pilotsLaunched >= 3,
    },
    {
      id: 'measured',
      name: 'Show Me the Numbers',
      description: 'Built baselines and a KPI dashboard.',
      earned: s.kpiDashboard,
    },
    {
      id: 'people-first',
      name: 'People First',
      description: 'AI Literacy level 2+ and champions in 2+ departments.',
      earned: s.literacy >= 2 && championDepts >= 2,
    },
    {
      id: 'guardian',
      name: 'Guardrails Engineer',
      description: '4+ governance policies in place.',
      earned: s.policies.length >= 4,
    },
    {
      id: 'zero-incidents',
      name: 'Clean Record',
      description: 'Finished the game with zero incidents.',
      earned: st.incidents === 0 && s.outcome === 'completed',
    },
    {
      id: 'roi-machine',
      name: 'ROI Machine',
      description: 'Finished with 1.5x+ ROI.',
      earned: roi(s) >= 1.5,
    },
    {
      id: 'scholar',
      name: 'Playbook Scholar',
      description: 'Unlocked 20+ Playbook principles.',
      earned: s.lessons.length >= 20,
    },
  ];
}

export function shareText(s: GameState, score: FinalScore, archetype: Archetype): string {
  const sc = scenarioOf(s);
  const outcome =
    s.outcome === 'fired' ? `fired in Q${((s.quarter - 1) % 4) + 1} of year ${Math.ceil(s.quarter / 4)}` : 'survived all 8 quarters';
  return [
    `🧠 AI Transformation Simulator: ${sc.company} (${sc.difficulty})`,
    `Grade ${score.grade} · ${score.total}/1000 · ${outcome}`,
    `Archetype: ${archetype.name}`,
    `💰 $${s.cumulativeValue.toFixed(1)}M value · ${roi(s).toFixed(2)}x ROI · ${Math.round(avgAdoption(s))}% adoption`,
    `📘 ${s.lessons.length} playbook principles learned`,
  ].join('\n');
}
