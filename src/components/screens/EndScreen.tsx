import { motion } from 'framer-motion';
import { Award, Check, Copy, Home, Lightbulb, Lock, RotateCcw, Sparkles, Target, TrendingDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LineChart } from '@/components/charts/LineChart';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Button } from '@/components/ui/Button';
import { LESSON_CATEGORIES, LESSON_MAP, LESSONS } from '@/data/lessons';
import { SCENARIOS } from '@/data/scenarios';
import { computeBadges, computeFinalScore, determineArchetype, sel, shareText, trustLosses, type GameState } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtMoney, fmtRoi, fmtSigned } from '@/lib/format';
import { play } from '@/lib/sfx';
import { useGameStore } from '@/store/gameStore';
import { PALETTE } from '@/lib/palette';

// Each grade's letter is a gradient from a light tint of its hue to the hue itself.
const GRADE_COLOR: Record<string, string> = {
  S: 'from-[color-mix(in_oklab,var(--color-hue-amber),white_55%)] via-[color-mix(in_oklab,var(--color-hue-amber),white_20%)] to-[color-mix(in_oklab,var(--color-hue-amber),black_8%)]',
  A: 'from-[color-mix(in_oklab,var(--color-hue-green),white_50%)] to-hue-green',
  B: 'from-[color-mix(in_oklab,var(--color-hue-sky),white_50%)] to-hue-sky',
  C: 'from-[color-mix(in_oklab,var(--color-hue-violet),white_50%)] to-hue-violet',
  D: 'from-[color-mix(in_oklab,var(--color-hue-orange),white_50%)] to-hue-orange',
  F: 'from-[color-mix(in_oklab,var(--color-hue-rose),white_50%)] to-hue-rose',
};

export function EndScreen() {
  const game = useGameStore((s) => s.game);
  if (!game) return null;
  return <Scorecard game={game} />;
}

function Scorecard({ game }: { game: GameState }) {
  const goTo = useGameStore((s) => s.goTo);
  const [copied, setCopied] = useState(false);
  const score = useMemo(() => computeFinalScore(game), [game]);
  const archetype = useMemo(() => determineArchetype(game, score), [game, score]);
  const badges = useMemo(() => computeBadges(game), [game]);
  const sc = SCENARIOS[game.scenarioId];
  const fired = game.outcome === 'fired';
  const losses = useMemo(() => (fired ? trustLosses(game) : []), [game, fired]);
  const xLabels = game.history.map((h) => `Q${h.quarter}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText(game, score, archetype));
      setCopied(true);
      play('coin');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-caps text-brand-cyan">
          {sc.company} · {sc.difficulty} · {game.playerName || 'Head of AI Transformation'}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-4xl font-bold text-white sm:text-5xl">
          {fired ? `Fired in Q${game.quarter}` : 'Transformation complete'}
        </motion.h1>
        <p className="mt-2 max-w-2xl text-ink-300">
          {fired
            ? 'The board lost confidence before the transformation could pay off. Here is what happened, and what to do differently.'
            : 'You survived all eight quarters. Here is how your transformation stacks up.'}
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
            className="glass flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="label-caps">Final grade</div>
            <motion.div
              initial={{ scale: 3, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 15 }}
              onAnimationComplete={() => play('stamp')}
              className={cn('bg-linear-to-br bg-clip-text font-display text-[120px] font-black leading-none text-transparent', GRADE_COLOR[score.grade])}
            >
              {score.grade}
            </motion.div>
            <div className="mt-1 text-3xl font-semibold text-white">
              <AnimatedNumber value={score.total} format={(v) => `${Math.round(v)}`} duration={1.6} />
              <span className="text-lg text-ink-400"> / 1000</span>
            </div>
            {fired && <div className="mt-2 text-xs text-rose-300">Score reduced 40% for being fired</div>}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass relative overflow-hidden p-6">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-violet/10 blur-3xl" aria-hidden />
            <div className="label-caps flex items-center gap-1.5">
              <Sparkles size={13} aria-hidden /> Your leadership archetype
            </div>
            <h2 className="mt-2 text-3xl font-bold text-white">{archetype.name}</h2>
            <p className="mt-1 text-lg italic text-brand-cyan">{archetype.tagline}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-200">{archetype.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-emerald-400/10 p-3 text-sm">
                <div className="font-semibold text-emerald-200">Strength</div>
                <div className="text-ink-100">{archetype.strength}</div>
              </div>
              <div className="rounded-xl bg-amber-300/10 p-3 text-sm">
                <div className="font-semibold text-amber-100">Blind spot</div>
                <div className="text-ink-100">{archetype.blindSpot}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {losses.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            aria-labelledby="why-fired"
            className="glass mt-4 border-rose-400/25 p-5"
          >
            <h3 id="why-fired" className="flex items-center gap-2 font-display text-base font-semibold text-white">
              <TrendingDown size={17} className="text-rose-300" aria-hidden /> Why the board lost confidence
            </h3>
            <p className="mt-1 text-sm text-ink-300">The biggest trust losses across your {game.history.length} board reviews, and what to try next time.</p>
            <ol className="mt-4 grid gap-3 md:grid-cols-3">
              {losses.map((l) => (
                <li key={l.kind} className="rounded-xl bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-white">{l.title}</span>
                    <span className="shrink-0 font-bold text-rose-300">{fmtSigned(l.delta)} trust</span>
                  </div>
                  <p className="mt-2 flex gap-2 text-sm text-ink-200">
                    <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-200" aria-hidden />
                    {l.tip}
                  </p>
                </li>
              ))}
            </ol>
          </motion.section>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="glass p-5">
            <h3 className="font-display text-base font-semibold text-white">Score breakdown</h3>
            <ul className="mt-3 space-y-3">
              {score.lines.map((l, i) => (
                <li key={l.key}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-100">{l.label}</span>
                    <span className="font-semibold text-white">
                      {l.points}
                      <span className="text-ink-400">/{l.max}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-violet/15">
                    <motion.div
                      className="h-full rounded-full bg-brand-violet"
                      initial={{ width: 0 }}
                      animate={{ width: `${(l.points / l.max) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="mt-0.5 text-xs text-ink-400">{l.detail}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass p-5">
            <h3 className="font-display text-base font-semibold text-white">Transformation stats</h3>
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ['Value delivered', fmtMoney(game.cumulativeValue)],
                ['Total spend', fmtMoney(game.cumulativeSpend)],
                ['ROI', fmtRoi(sel.roi(game))],
                ['Live systems', `${sel.productionProjects(game).length}`],
                ['Pilots launched', `${game.stats.pilotsLaunched}`],
                ['Ideal approach picks', `${game.stats.idealPicks}/${game.stats.pilotsLaunched}`],
                ['Pilots killed', `${game.stats.killed}`],
                ['Incidents', `${game.stats.incidents}`],
                ['Peak risk', `${game.stats.peakRisk}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/4 p-3">
                  <dt className="text-xs text-ink-400">{k}</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {game.history.length > 0 && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <LineChart
              title="Value per quarter vs. board target"
              subtitle="$M per quarter. The target rises every quarter and grows with executive hype."
              xLabels={xLabels}
              format={(v) => fmtMoney(v)}
              series={[
                { key: 'value', label: 'Value delivered', color: PALETTE.chart.value, values: game.history.map((h) => h.runRate) },
                { key: 'target', label: 'Board target', color: PALETTE.chart.target, values: game.history.map((h) => h.expected) },
              ]}
            />
            <LineChart
              title="Board trust & workforce morale"
              subtitle="0–100 at the end of each quarter."
              xLabels={xLabels}
              format={(v) => `${Math.round(v)}`}
              yMax={100}
              reference={{ value: 15, label: 'Fired below 15' }}
              series={[
                { key: 'trust', label: 'Board trust', color: PALETTE.chart.trust, values: game.history.map((h) => h.trust) },
                { key: 'morale', label: 'Morale', color: PALETTE.chart.morale, values: game.history.map((h) => h.morale) },
              ]}
            />
          </div>
        )}

        <div className="mt-4 glass p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <Award size={17} aria-hidden /> Badges ({badges.filter((b) => b.earned).length}/{badges.length})
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {badges.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className={cn('rounded-xl border p-3', b.earned ? 'border-amber-300/40 bg-amber-300/10' : 'border-dashed border-white/10')}
              >
                <div className={cn('flex items-center gap-1.5 text-sm font-semibold', b.earned ? 'text-white' : 'text-ink-200')}>
                  {b.earned ? <Check size={14} className="text-amber-200" aria-hidden /> : <Lock size={13} aria-hidden />}
                  {b.name}
                </div>
                <div className="mt-0.5 text-xs text-ink-300">{b.description}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 glass p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <Target size={17} aria-hidden /> What you learned: {game.lessons.length}/{LESSONS.length} playbook principles
          </h3>
          {game.lessons.length === 0 ? (
            <p className="mt-2 text-sm text-ink-400">No principles unlocked this time.</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {game.lessons.map((id) => {
                const l = LESSON_MAP[id];
                if (!l) return null;
                return (
                  <li key={id} className="rounded-xl bg-white/3 p-3">
                    <div className="text-xs font-semibold" style={{ color: LESSON_CATEGORIES[l.category].color }}>
                      {LESSON_CATEGORIES[l.category].label}
                    </div>
                    <div className="text-sm font-semibold text-white">{l.title}</div>
                    <div className="text-xs text-ink-300">{l.principle}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={() => goTo('title')} icon={<Home size={16} />}>
            Title screen
          </Button>
          <Button variant="secondary" onClick={copy} icon={copied ? <Check size={16} /> : <Copy size={16} />}>
            {copied ? 'Copied!' : 'Copy results'}
          </Button>
          <Button variant="primary" onClick={() => goTo('setup')} icon={<RotateCcw size={16} />}>
            Play again
          </Button>
        </div>
      </div>
    </div>
  );
}
