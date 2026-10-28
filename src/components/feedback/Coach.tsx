import { motion } from 'framer-motion';
import { Compass, X } from 'lucide-react';
import { useEffect } from 'react';
import { sel, type GameState } from '@/engine';
import { useGame, useGameStore } from '@/store/gameStore';

type Step = 'audit' | 'pilot' | 'capacity' | 'end';

interface Tip {
  step: Step;
  text: string;
}

/** The next thing a first-time player should do, from what they have done so far this quarter. */
function tipFor(s: GameState): Tip {
  const left = sel.capacityLeft(s);
  if (left === 0) {
    return { step: 'end', text: 'Capacity spent. End the quarter: pilots make progress, and the board reviews how you did.' };
  }
  if (!Object.values(s.departments).some((d) => d.audited)) {
    return {
      step: 'audit',
      text: 'Start on the Org Map: press Audit on a department to reveal its use cases. An audit costs 1 capacity.',
    };
  }
  if (s.projects.length === 0) {
    return {
      step: 'pilot',
      text: 'Open the department you audited, pick a use case, read the clues, and launch a pilot with the approach that fits.',
    };
  }
  return {
    step: 'capacity',
    text: `You have ${left} capacity left, shown at the bottom. It doesn't carry over, so audit another department or launch another pilot before you end the quarter.`,
  };
}

const ORDER: Step[] = ['audit', 'pilot', 'capacity', 'end'];

/**
 * Guided first quarter for new players: one tip at a time, and a ring around the part of the
 * screen it talks about. Shown in quarter 1 of a player's first game until they hide it.
 */
export function Coach() {
  const game = useGame();
  const finishedGames = useGameStore((s) => s.finishedGames);
  const coachOff = useGameStore((s) => s.coachOff);
  const hideCoach = useGameStore((s) => s.hideCoach);
  const tab = useGameStore((s) => s.tab);
  const setTab = useGameStore((s) => s.setTab);

  const active = finishedGames === 0 && !coachOff && game.quarter === 1 && game.phase === 'planning';
  const tip = active ? tipFor(game) : null;
  const step = tip?.step;

  // Rings the element the tip points at (see [data-coach-target] in index.css).
  useEffect(() => {
    if (!step) return;
    document.documentElement.dataset.coach = step;
    return () => {
      delete document.documentElement.dataset.coach;
    };
  }, [step]);

  if (!tip) return null;
  const needsOrg = (tip.step === 'audit' || tip.step === 'pilot') && tab !== 'org';

  return (
    // Not keyed by step: the live region has to stay mounted for the next tip to be announced.
    <motion.aside
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Tip"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/8 p-3 pr-2 sm:p-4 sm:pr-2"
    >
      <Compass size={18} className="mt-0.5 shrink-0 text-brand-cyan" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="label-caps text-brand-cyan">
          First quarter · tip {ORDER.indexOf(tip.step) + 1} of {ORDER.length}
        </div>
        <p className="mt-1 text-sm text-ink-100" aria-live="polite">
          {tip.text}
        </p>
        {needsOrg && (
          <button onClick={() => setTab('org')} className="mt-1.5 text-sm font-semibold text-brand-cyan hover:underline">
            Go to the Org Map →
          </button>
        )}
      </div>
      <button
        onClick={hideCoach}
        aria-label="Hide tips"
        title="Hide tips"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-300 hover:bg-white/10 hover:text-white"
      >
        <X size={16} aria-hidden />
      </button>
    </motion.aside>
  );
}
