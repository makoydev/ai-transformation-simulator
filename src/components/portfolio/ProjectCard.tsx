import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Skull } from 'lucide-react';
import { forwardRef } from 'react';
import { Meter } from '@/components/ui/Meter';
import { APPROACHES } from '@/data/approaches';
import { DEPARTMENTS } from '@/data/departments';
import { sel, type Project } from '@/engine';
import { cn } from '@/lib/cn';
import { RESULT_STYLE } from '@/lib/labels';
import { fmtMoney } from '@/lib/format';
import { APPROACH_ICONS, DEPT_ICONS } from '@/lib/icons';
import { useGameStore } from '@/store/gameStore';
import { PALETTE } from '@/lib/palette';



export const ProjectCard = forwardRef<HTMLButtonElement, { project: Project }>(function ProjectCard({ project: p }, ref) {
  const openProject = useGameStore((s) => s.openProject);
  const revealed = useGameStore((s) => s.revealed.includes(p.id));
  const uc = sel.caseOf(p);
  const ap = APPROACHES[p.approach];
  const DeptIcon = DEPT_ICONS[uc.dept];
  const ApIcon = APPROACH_ICONS[p.approach];
  const stalled = p.stage === 'results' && p.stalledQuarters >= 1;
  const archived = !sel.isActive(p);
  const totalQuarters = p.iterations > 0 ? 1 : ap.pilotQuarters;

  return (
    <motion.button
      ref={ref}
      layout
      layoutId={p.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: archived ? 0.6 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      whileHover={{ y: -2 }}
      onClick={() => openProject(p.id)}
      className={cn(
        'w-full rounded-xl border bg-ink-800/80 p-3 text-left transition-colors hover:border-white/25',
        p.stage === 'results' && !revealed ? 'animate-pulse-ring border-amber-300/50' : 'border-white/[0.07]',
        stalled && 'border-rose-400/50',
      )}
    >
      <div className="flex items-start gap-2">
        <DeptIcon size={14} className="mt-0.5 shrink-0" style={{ color: DEPARTMENTS[uc.dept].color }} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{uc.title}</div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: ap.color }}>
            <ApIcon size={11} aria-hidden /> {ap.short}
            {p.iterations > 0 && <span className="text-ink-400"> · iteration {p.iterations + 1}</span>}
          </div>
        </div>
        {p.stage === 'production' && p.hitl && (
          <span title="Human-in-the-loop enabled" className="text-emerald-300">
            <ShieldCheck size={15} aria-label="HITL on" />
          </span>
        )}
      </div>

      {p.stage === 'pilot' && (
        <div className="mt-2.5">
          <div className="mb-1 flex justify-between text-[11px] text-ink-400">
            <span>Pilot progress</span>
            <span>
              {p.quartersRemaining} quarter{p.quartersRemaining === 1 ? '' : 's'} to results
            </span>
          </div>
          <Meter value={totalQuarters - p.quartersRemaining} max={totalQuarters} color={PALETTE.hue.sky} label="Pilot progress" />
        </div>
      )}

      {p.stage === 'results' && p.result && (
        <div className="mt-2.5 flex items-center gap-2">
          {revealed ? (
            <span className={cn('rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider', RESULT_STYLE[p.result].cls)}>
              {RESULT_STYLE[p.result].label}
            </span>
          ) : (
            <span className="shimmer rounded-md border border-amber-300/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-100">
              Results ready: open
            </span>
          )}
          {stalled && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300">
              <AlertTriangle size={12} aria-hidden /> PoC purgatory
            </span>
          )}
        </div>
      )}

      {p.stage === 'production' && (
        <div className="mt-2.5 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-ink-400">Value</span>
            <span className="font-semibold text-amber-200">{fmtMoney(sel.projectValue(p))}/q</span>
          </div>
          <Meter value={p.adoption} color={PALETTE.metric.adoption} label="Adoption" />
          <div className="text-[11px] text-ink-400">{Math.round(p.adoption)}% adoption</div>
        </div>
      )}

      {archived && (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-400">
          <Skull size={12} aria-hidden /> {p.stage === 'killed' ? 'Killed' : 'Retired'} in Q{p.endedQuarter} ·{' '}
          {fmtMoney(p.valueRealized)} delivered
        </div>
      )}
    </motion.button>
  );
});
