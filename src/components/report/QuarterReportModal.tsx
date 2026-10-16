import { motion } from 'framer-motion';
import { ArrowRight, Flag, Gavel, PartyPopper } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Button } from '@/components/ui/Button';
import { Meter } from '@/components/ui/Meter';
import { Modal } from '@/components/ui/Modal';
import { VerdictBadge } from '@/components/ui/Verdict';
import { cn } from '@/lib/cn';
import { fmtMoney, fmtSigned, quarterLabel } from '@/lib/format';
import { useGameStore } from '@/store/gameStore';

const QUARTER_LABEL = { great: 'Outstanding quarter', good: 'Good quarter', mixed: 'Mixed quarter', bad: 'Tough quarter' } as const;

function Figure({ label, value, sub, delay }: { label: string; value: React.ReactNode; sub?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="rounded-xl bg-white/4 p-3">
      <div className="text-[11px] text-ink-400">{label}</div>
      <div className="mt-0.5 text-xl font-semibold text-white">{value}</div>
      {sub && <div className="text-[11px] text-ink-400">{sub}</div>}
    </motion.div>
  );
}

export function QuarterReportModal() {
  const game = useGameStore((s) => s.game);
  const advance = useGameStore((s) => s.advanceFromReport);
  const setTab = useGameStore((s) => s.setTab);
  const report = game?.lastReport;
  const open = game?.phase === 'report' && !!report;

  return (
    <Modal open={open} size="lg" label="Quarterly board review" z={55}>
      {report && game && (
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink-200">
              <Gavel size={13} aria-hidden /> Board review · {quarterLabel(report.quarter)}
            </span>
            {report.outcome === 'continue' && <VerdictBadge verdict={report.verdict} label={QUARTER_LABEL[report.verdict]} />}
          </div>
          <h2 className={cn('mt-3 text-2xl font-bold sm:text-3xl', report.outcome === 'fired' ? 'text-rose-200' : 'text-white')}>{report.headline}</h2>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Figure label="Value delivered" value={<AnimatedNumber value={report.valueThisQuarter} format={(v) => fmtMoney(v)} />} sub="this quarter" delay={0.1} />
            <Figure
              label="Board target"
              value={report.expected > 0 ? fmtMoney(report.expected) : 'n/a'}
              sub={report.measured ? 'measured value' : `credited ${fmtMoney(report.perceivedValue)} (unmeasured)`}
              delay={0.18}
            />
            <Figure label="Run costs paid" value={fmtMoney(report.runCosts)} sub="licenses, inference, team" delay={0.26} />
            <Figure
              label="Next quarter's budget"
              value={report.outcome === 'continue' ? `+${fmtMoney(report.allocation)}` : 'n/a'}
              sub="scales with board trust"
              delay={0.34}
            />
          </div>

          {report.expected > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-ink-300">
                <span>Value the board credited vs. target</span>
                <span className="font-semibold text-white">{Math.round((report.perceivedValue / report.expected) * 100)}%</span>
              </div>
              <Meter value={Math.min(report.perceivedValue / report.expected, 1.5)} max={1.5} marker={1} color="#fbbf24" height="h-2.5" label="Value versus target" />
            </motion.div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="label-caps mb-2">Board trust factors</div>
              <ul className="space-y-1.5">
                {report.factors.map((f, i) => (
                  <motion.li
                    key={f.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.12 }}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white/3 px-3 py-2 text-sm"
                  >
                    <span className="text-ink-100">{f.label}</span>
                    <span className={cn('font-bold', f.delta > 0 ? 'text-emerald-300' : f.delta < 0 ? 'text-rose-300' : 'text-ink-300')}>{fmtSigned(f.delta)}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + report.factors.length * 0.12 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-ink-800/70 px-6 py-4"
            >
              <div className="label-caps">Board trust</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg text-ink-400 line-through decoration-ink-500">{report.trustBefore}</span>
                <AnimatedNumber
                  value={report.trustAfter}
                  format={(v) => `${Math.round(v)}`}
                  duration={1.4}
                  className={cn('text-5xl font-semibold', report.trustAfter >= report.trustBefore ? 'text-emerald-300' : 'text-rose-300')}
                />
              </div>
              <div className="text-xs text-ink-400">fired below 15</div>
            </motion.div>
          </div>

          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + report.factors.length * 0.12 }}
            className="mt-6 border-l-2 border-brand-violet/60 pl-4 text-base italic text-ink-200"
          >
            {report.boardQuote}
            <footer className="mt-1 text-xs not-italic text-ink-400">Board of Directors</footer>
          </motion.blockquote>

          {report.completedPilots.length > 0 && report.outcome === 'continue' && (
            <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
              {report.completedPilots.length} pilot{report.completedPilots.length > 1 ? 's have' : ' has'} results waiting in your Portfolio.
              Decide this quarter to avoid PoC purgatory.
            </div>
          )}

          {report.outcome === 'fired' && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 p-4 text-sm text-rose-100">
              <Flag size={18} className="mt-0.5 shrink-0" aria-hidden />
              Board trust fell below 15. You've been thanked for your contributions and "transitioned to an advisory role." Let's
              see what you learned.
            </div>
          )}
          {report.outcome === 'completed' && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-amber-100">
              <PartyPopper size={18} className="mt-0.5 shrink-0" aria-hidden />
              You made it through all eight quarters. Time for the final scorecard.
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              autoFocus
              onClick={() => {
                if (report.completedPilots.length && report.outcome === 'continue') setTab('portfolio');
                advance();
              }}
              icon={<ArrowRight size={18} />}
            >
              {report.outcome === 'continue' ? `Begin ${quarterLabel(report.quarter + 1)}` : 'See your scorecard'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
