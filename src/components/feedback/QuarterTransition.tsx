import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { quarterLabel } from '@/lib/format';
import { useGameStore } from '@/store/gameStore';

const TAGLINES = [
  'The board is watching.',
  'Every quarter counts.',
  'Ship value, not slides.',
  'Halfway there. Expectations are rising.',
  'Year two. The pilots should be paying off.',
  'The board wants compounding returns.',
  'Two quarters left to make your case.',
  'The final quarter. Make it count.',
];

/** Full-screen title card between quarters. */
export function QuarterTransition() {
  const transition = useGameStore((s) => s.transition);
  const clear = useGameStore((s) => s.clearTransition);

  useEffect(() => {
    if (!transition) return;
    const t = setTimeout(clear, 1700);
    return () => clearTimeout(t);
  }, [transition, clear]);

  return (
    <AnimatePresence>
      {transition && (
        <motion.div
          key={transition.key}
          className="fixed inset-0 z-70 flex items-center justify-center overflow-hidden bg-ink-950/95"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          exit={{ clipPath: 'inset(0 0 0 100%)' }}
          transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          onClick={clear}
          aria-live="polite"
        >
          <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="label-caps text-brand-cyan"
            >
              Quarter {transition.quarter} of 8
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9, letterSpacing: '0.3em' }}
              animate={{ opacity: 1, scale: 1, letterSpacing: '0em' }}
              transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
              className="text-gradient mt-2 font-display text-5xl font-bold sm:text-7xl"
            >
              {quarterLabel(transition.quarter)}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-3 text-ink-300">
              {TAGLINES[transition.quarter - 1] ?? ''}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
