import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Check, Rocket } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SCENARIO_ORDER, SCENARIOS } from '@/data/scenarios';
import type { ScenarioId } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtMoney } from '@/lib/format';
import { rovingKeyDown } from '@/lib/roving';
import { play } from '@/lib/sfx';
import { useGameStore } from '@/store/gameStore';

const DIFFICULTY_STYLE = {
  Relaxed: 'bg-emerald-400/15 text-emerald-200',
  Standard: 'bg-sky-400/15 text-sky-200',
  Brutal: 'bg-rose-500/15 text-rose-200',
} as const;

export function SetupScreen() {
  const newGame = useGameStore((s) => s.newGame);
  const goTo = useGameStore((s) => s.goTo);
  // New players start on the company built for learning; returning players on the standard one.
  const firstGame = useGameStore((s) => s.finishedGames === 0 && s.game?.phase !== 'ended');
  const [scenario, setScenario] = useState<ScenarioId>(() => (firstGame ? 'lumen' : 'pemberton'));
  const [name, setName] = useState('');

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <button onClick={() => goTo('title')} className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white">
          <ArrowLeft size={15} /> Back
        </button>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-3xl font-bold text-white sm:text-4xl">
          Accept the offer
        </motion.h1>
        <p className="mt-2 text-ink-300">Choose the company you'll transform. Each one plays very differently.</p>

        <label className="mt-8 block max-w-sm">
          <span className="label-caps">Your name (for the scorecard)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="e.g. Alex Rivera"
            className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-white placeholder:text-ink-400 focus:border-brand-cyan focus:outline-hidden"
          />
        </label>

        <div className="mt-8 grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Company" onKeyDown={rovingKeyDown}>
          {SCENARIO_ORDER.map((id, i) => {
            const sc = SCENARIOS[id];
            const selected = scenario === id;
            return (
              <motion.button
                key={id}
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, scale: selected ? 1.02 : 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                whileHover={{ y: -4 }}
                onClick={() => {
                  play('select');
                  setScenario(id);
                }}
                className={cn('glass relative flex flex-col p-5 text-left', selected ? 'shadow-glow' : 'hover:border-white/20')}
              >
                {selected && (
                  <motion.span layoutId="scenario-check" className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan">
                    <Check size={14} className="text-ink-950" />
                  </motion.span>
                )}
                <div className="flex flex-wrap items-center gap-2 pr-8">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', DIFFICULTY_STYLE[sc.difficulty])}>{sc.difficulty}</span>
                  {firstGame && id === 'lumen' && (
                    <span className="rounded-full border border-emerald-400/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">
                      Recommended for your first game
                    </span>
                  )}
                </div>
                <Building2 size={22} className="mt-4 text-ink-300" aria-hidden />
                <h2 className="mt-2 font-display text-xl font-bold text-white">{sc.company}</h2>
                <div className="text-xs text-ink-400">{sc.industry}</div>
                <p className="mt-3 text-sm italic text-ink-200">{sc.tagline}</p>
                <p className="mt-2 text-sm text-ink-300">{sc.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white/4 p-2">
                    <dt className="text-ink-400">Starting budget</dt>
                    <dd className="font-semibold text-white">{fmtMoney(sc.startBudget)}</dd>
                  </div>
                  <div className="rounded-lg bg-white/4 p-2">
                    <dt className="text-ink-400">Board trust</dt>
                    <dd className="font-semibold text-white">{sc.startTrust}</dd>
                  </div>
                  <div className="rounded-lg bg-white/4 p-2">
                    <dt className="text-ink-400">Regulation</dt>
                    <dd className="font-semibold text-white">×{sc.regulation.toFixed(2)}</dd>
                  </div>
                  <div className="rounded-lg bg-white/4 p-2">
                    <dt className="text-ink-400">Morale</dt>
                    <dd className="font-semibold text-white">{sc.startMorale}</dd>
                  </div>
                </dl>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="primary" size="lg" onClick={() => newGame(scenario, name)} icon={<Rocket size={18} />}>
            Start day one at {SCENARIOS[scenario].company}
          </Button>
        </div>
      </div>
    </div>
  );
}
