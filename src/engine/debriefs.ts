/**
 * The learning loop: turns pilot outcomes into explanations of *why* an
 * approach did or didn't fit the problem.
 */
import { APPROACHES, BUILD, GENERATIVE } from '@/data/approaches';
import { DEPARTMENTS } from '@/data/departments';
import type { UseCaseDef } from '@/data/useCases';
import type { ApproachId, Debrief, Fit, PilotResult, Verdict } from './types';

interface MismatchInsight {
  text: string;
  lessonId: string;
}

/** Explains why the chosen approach was a poor fit for the problem's shape. */
export function mismatchInsight(uc: UseCaseDef, chosen: ApproachId): MismatchInsight {
  const ideal = uc.ideal;
  if (chosen === 'finetune' && ideal === 'rag') {
    return {
      text: 'Fine-tuning teaches a model style and format, not reliable facts, and those facts go stale the moment documents change. For knowledge questions, retrieval (RAG) is cheaper, fresher, and citable.',
      lessonId: 'rag-vs-finetune',
    };
  }
  if (ideal === 'process' && chosen !== 'process') {
    return {
      text: 'The root cause was the process itself. Layering AI on a broken workflow automates the dysfunction, and it costs far more than fixing the policy.',
      lessonId: 'process-before-ai',
    };
  }
  if (ideal === 'predictive' && GENERATIVE.includes(chosen)) {
    return {
      text: 'This was a numeric prediction problem with structured historical data. Generative models are expensive and unreliable for forecasting or classification at scale. Classic ML is faster, cheaper, and measurable.',
      lessonId: 'predictive-not-genai',
    };
  }
  if (ideal === 'buy' && BUILD.includes(chosen)) {
    return {
      text: 'Mature products already solve this. Building it yourself costs more, takes longer, and leaves you maintaining a commodity. Save your build capacity for problems that differentiate you.',
      lessonId: 'buy-commodity',
    };
  }
  if (chosen === 'agentic') {
    return {
      text: 'Agents add autonomy, along with complexity, cost, and blast radius. When a simpler approach solves the problem, autonomy is a liability, not a feature.',
      lessonId: 'simplest-thing',
    };
  }
  if (chosen === 'process') {
    return {
      text: 'A process tweak helped at the margins, but the core problem genuinely needed intelligence: language understanding or pattern recognition that rules alone can\'t provide.',
      lessonId: 'use-case-fit',
    };
  }
  if (chosen === 'buy' && BUILD.includes(ideal)) {
    return {
      text: "Off-the-shelf tools couldn't handle what makes this problem specific to you: your data, workflows, or formats. This is where building creates a real advantage.",
      lessonId: 'buy-commodity',
    };
  }
  return {
    text: `${APPROACHES[chosen].name} didn't match the shape of this problem. Ask whether the output is text, a number, or an action, and where the knowledge actually lives.`,
    lessonId: 'use-case-fit',
  };
}

function pilotVerdict(fit: Fit, result: PilotResult): Verdict {
  if (fit === 'poor') return 'bad';
  if (result === 'failed') return fit === 'ideal' ? 'mixed' : 'bad';
  if (fit === 'ideal') return result === 'success' ? 'great' : 'good';
  return result === 'success' ? 'good' : 'mixed';
}

const RESULT_HEADLINE: Record<PilotResult, string> = {
  success: 'Pilot hit its success criteria',
  mixed: 'Pilot results were mixed',
  failed: 'Pilot missed its success criteria',
};

export function buildPilotDebrief(
  uc: UseCaseDef,
  approach: ApproachId,
  fit: Fit,
  result: PilotResult,
  readinessGap: number,
  readiness: number,
  required: number,
): Omit<Debrief, 'id' | 'quarter'> {
  const verdict = pilotVerdict(fit, result);
  const ap = APPROACHES[approach];
  const idealAp = APPROACHES[uc.ideal];
  const parts: string[] = [];
  let lessonId = uc.lessonId;

  if (fit === 'ideal') {
    parts.push(`${ap.name} was exactly the right call. ${uc.why}`);
  } else if (fit === 'acceptable') {
    parts.push(
      `${ap.name} is a reasonable fit, so it captures part of the value. ${idealAp.name} would have fit best: ${uc.why}`,
    );
  } else {
    const mismatch = mismatchInsight(uc, approach);
    parts.push(mismatch.text);
    parts.push(`The better choice was ${idealAp.name}. ${uc.why}`);
    lessonId = mismatch.lessonId;
  }

  if (readinessGap > 0) {
    parts.push(
      `Data readiness in ${DEPARTMENTS[uc.dept].name} was ${readiness}/100 against roughly ${required} needed, so the pilot fought messy or missing data the whole way.`,
    );
    if (result !== 'success' && fit !== 'poor') lessonId = 'data-readiness';
  }

  if (fit === 'poor' && result === 'success') {
    parts.push(
      'The demo "worked", but technical success is not business value. Projected value is a fraction of what the right approach would capture.',
    );
  }

  return {
    kind: 'pilot',
    verdict,
    title: `${uc.title}: ${RESULT_HEADLINE[result]}`,
    summary: `You piloted ${ap.name} for "${uc.title}".`,
    insight: parts.join(' '),
    lessonId,
  };
}
