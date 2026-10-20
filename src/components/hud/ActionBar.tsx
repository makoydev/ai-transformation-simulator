import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Hourglass } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Tooltip } from '@/components/ui/Tooltip';
import { BALANCE, sel } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtMoney } from '@/lib/format';
import { useGame, useGameStore } from '@/store/gameStore';

export function ActionBar() {
  const game = useGame();
  const endQuarter = useGameStore((s) => s.endQuarter);
  const setTab = useGameStore((s) => s.setTab);
  const total = sel.capacityTotal(game);
  const left = sel.capacityLeft(game);
  const stalled = sel.stalledProjects(game);
  const awaiting = sel.projectsIn(game, 'results');
  const costs = sel.quarterlyCosts(game).total;
  const [confirmEnd, setConfirmEnd] = useState(false);
  const quarterOfYear = ((game.quarter - 1) % 4) + 1;

  // Things the player loses by ending the quarter now. Unused capacity doesn't carry over,
  // and an undecided pilot drops into (or stays in) PoC purgatory.
  const newlyStalling = awaiting.length - stalled.length;
  const warnings = [
    left > 0 && `${left} of ${total} capacity unused. It doesn't carry over to next quarter.`,
    newlyStalling > 0 &&
      `${newlyStalling} pilot${newlyStalling > 1 ? 's' : ''} awaiting a decision will fall into PoC purgatory and cost board trust.`,
    stalled.length > 0 &&
      `${stalled.length} pilot${stalled.length > 1 ? 's are' : ' is'} still in PoC purgatory and will cost board trust again.`,
  ].filter((w): w is string => Boolean(w));

  const requestEnd = () => (warnings.length ? setConfirmEnd(true) : endQuarter());

  return (
    <div className="glass-strong sticky bottom-3 z-30 mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:px-4 sm:py-3">
      <Tooltip
        side="top"
        content="Team capacity: how many initiatives your team can drive this quarter. Most actions cost 1. Hire engineering squads to grow it."
      >
        <div tabIndex={0} className="flex items-center gap-2">
          <span className="label-caps">Capacity</span>
          <div className="flex gap-1" aria-label={`${left} of ${total} capacity left`}>
            {Array.from({ length: total }, (_, i) => (
              <motion.span
                key={i}
                layout
                className={cn('h-3 w-3 rounded-full border', i < left ? 'border-brand-cyan bg-brand-cyan shadow-glow-cyan' : 'border-white/20 bg-transparent')}
                animate={i < left ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-white">
            {left}/{total}
          </span>
        </div>
      </Tooltip>

      <div className="hidden h-6 w-px bg-white/10 sm:block" />

      <div className="hidden text-sm text-ink-300 sm:block">
        <span className="font-semibold text-white">{fmtMoney(game.budget)}</span> available
        {costs > 0 && <span className="text-ink-400"> · {fmtMoney(costs)} due at quarter end</span>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {awaiting.length > 0 && (
          <button
            onClick={() => setTab('portfolio')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
              stalled.length ? 'border-rose-400/40 bg-rose-500/15 text-rose-200' : 'border-amber-300/40 bg-amber-400/15 text-amber-100',
            )}
          >
            <Hourglass size={13} aria-hidden />
            {awaiting.length} pilot{awaiting.length > 1 ? 's' : ''} awaiting decision
            {stalled.length > 0 ? ` (${stalled.length} in PoC purgatory)` : ': decide this quarter'}
          </button>
        )}
        {game.trust < BALANCE.warningThreshold && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-200">
            <AlertTriangle size={13} aria-hidden /> Board trust critical
          </span>
        )}
      </div>

      <div className="ml-auto">
        <Button
          variant="primary"
          onClick={requestEnd}
          disabled={game.phase !== 'planning'}
          className={cn(left === 0 && 'animate-pulse-ring')}
          icon={<ArrowRight size={18} />}
        >
          End Q{quarterOfYear}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmEnd}
        tone="warning"
        title={`End Q${quarterOfYear} now?`}
        message={
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        }
        confirmLabel="End anyway"
        cancelLabel="Go back"
        onCancel={() => setConfirmEnd(false)}
        onConfirm={() => {
          setConfirmEnd(false);
          endQuarter();
        }}
      />
    </div>
  );
}
