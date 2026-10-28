import { motion } from 'framer-motion';
import { ArrowRight, Bot, FileSearch, Gauge, Info, Play, ShieldCheck, TrendingUp, Users, Workflow, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SCENARIOS } from '@/data/scenarios';
import { quarterLabel } from '@/lib/format';
import { BrandIcon } from '@/lib/icons';
import { useGameStore } from '@/store/gameStore';

const PILLARS = [
  { icon: FileSearch, title: 'Discovery & triage', text: 'Audit departments and spot the process problems disguised as AI problems.' },
  { icon: Workflow, title: 'Build vs. buy', text: 'Process fix, copilot, RAG, agents, fine-tuning, or classic ML. Pick the right tool.' },
  { icon: ShieldCheck, title: 'Governance & risk', text: 'Shadow AI, hallucinations, prompt injection, bias, regulators.' },
  { icon: Users, title: 'Change & adoption', text: 'Fearful employees, hyped executives, and skeptical veterans.' },
  { icon: TrendingUp, title: 'Escape PoC purgatory', text: 'Scale winners, kill losers, and prove ROI to the board.' },
  { icon: Gauge, title: "Don't get fired", text: 'Board trust below 15 and you\'re "transitioned to an advisory role".' },
];

const FLOATING = [
  { label: 'PILOT: SUCCESS', cls: 'border-emerald-400/40 text-emerald-300', x: '6%', y: '16%', r: -8, d: 0 },
  { label: 'PoC PURGATORY', cls: 'border-rose-400/40 text-rose-300', x: '82%', y: '12%', r: 6, d: 1.2 },
  { label: 'HITL: ON', cls: 'border-sky-400/40 text-sky-300', x: '88%', y: '44%', r: -5, d: 0.6 },
  { label: 'BOARD TRUST +6', cls: 'border-violet-400/40 text-violet-300', x: '3%', y: '42%', r: 7, d: 1.8 },
];

export function TitleScreen() {
  const game = useGameStore((s) => s.game);
  const continueGame = useGameStore((s) => s.continueGame);
  const goTo = useGameStore((s) => s.goTo);
  const setHowTo = useGameStore((s) => s.setHowTo);
  const saveDiscarded = useGameStore((s) => s.saveDiscarded);
  const dismissSaveNotice = useGameStore((s) => s.dismissSaveNotice);
  const canContinue = game && game.phase !== 'ended';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-70" aria-hidden />
      <motion.div
        className="absolute -left-40 top-20 h-112 w-md rounded-full bg-brand-violet/10 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="absolute -right-40 bottom-0 h-120 w-120 rounded-full bg-brand-cyan/8 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      {FLOATING.map((f) => (
        <motion.div
          key={f.label}
          className={`absolute hidden rounded-lg border bg-ink-900/70 px-3 py-1.5 font-display text-xs font-bold tracking-widest backdrop-blur-sm xl:block ${f.cls}`}
          style={{ left: f.x, top: f.y, rotate: f.r }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.85, 0.85], scale: 1, y: [0, -10, 0] }}
          transition={{ delay: 0.6 + f.d, duration: 6, repeat: Infinity, repeatType: 'mirror' }}
          aria-hidden
        >
          {f.label}
        </motion.div>
      ))}

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow"
        >
          <BrandIcon size={34} className="text-white" aria-hidden />
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="label-caps mt-6 text-brand-cyan">
          A corporate strategy game
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 120 }}
          className="mt-3 text-5xl font-bold leading-[1.05] text-white sm:text-7xl"
        >
          AI Transformation
          <br />
          <span className="text-gradient">Simulator</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-5 max-w-2xl text-base text-ink-200 sm:text-lg"
        >
          You're the new Head of AI Transformation at a 90-year-old company. Eight quarters. Six opinionated executives. One
          board that wants ROI. <span className="text-white">Don't get fired.</span>
        </motion.p>

        {saveDiscarded && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 py-1 pl-3 pr-1 text-sm text-amber-100">
            <Info size={15} className="shrink-0" aria-hidden />
            The game was updated, and your saved game couldn't be kept.
            <button
              onClick={dismissSaveNotice}
              aria-label="Dismiss"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-amber-200 hover:bg-white/10"
            >
              <X size={15} aria-hidden />
            </button>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-wrap justify-center gap-3">
          {canContinue && game && (
            <Button variant="primary" size="lg" onClick={continueGame} icon={<Play size={18} />}>
              Continue: {SCENARIOS[game.scenarioId].company}, {quarterLabel(game.quarter)}
            </Button>
          )}
          <Button variant={canContinue ? 'secondary' : 'primary'} size="lg" onClick={() => goTo('setup')} icon={<ArrowRight size={18} />}>
            New game
          </Button>
          {game?.phase === 'ended' && (
            <Button variant="secondary" size="lg" onClick={() => goTo('end')}>
              View last scorecard
            </Button>
          )}
          <Button variant="ghost" size="lg" onClick={() => setHowTo(true)}>
            How to play
          </Button>
        </motion.div>

        <div className="mt-14 grid w-full gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.07 }}
                whileHover={{ y: -4 }}
                className="glass p-4"
              >
                <Icon size={18} className="text-brand-cyan" aria-hidden />
                <h2 className="mt-2 font-display font-semibold text-white">{p.title}</h2>
                <p className="mt-1 text-sm text-ink-300">{p.text}</p>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 flex items-center gap-1.5 text-xs text-ink-400">
          <Bot size={13} aria-hidden /> Every crisis comes with a debrief grounded in real-world enterprise AI cases.
        </p>
      </div>
    </div>
  );
}
