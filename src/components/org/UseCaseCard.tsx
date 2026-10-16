import { motion } from 'framer-motion';
import { ArrowRight, Eye, Globe2, Lightbulb, Quote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { APPROACHES } from '@/data/approaches';
import { DEPARTMENTS } from '@/data/departments';
import type { UseCaseDef } from '@/data/useCases';
import { BALANCE, sel } from '@/engine';
import { cn } from '@/lib/cn';
import { dataNeedLabel, sensitivityLabel } from '@/lib/labels';
import { fmtMoney } from '@/lib/format';
import { useGameStore } from '@/store/gameStore';

export function UseCaseCard({ useCase: uc, index, onTriage }: { useCase: UseCaseDef; index: number; onTriage: () => void }) {
  const game = useGameStore((s) => s.game)!;
  const openProject = useGameStore((s) => s.openProject);
  const openDept = useGameStore((s) => s.openDept);
  const active = sel.activeProjectFor(game, uc.id);
  const past = game.projects.filter((p) => p.useCaseId === uc.id && !sel.isActive(p));
  const dept = DEPARTMENTS[uc.dept];
  const sens = sensitivityLabel(uc.sensitivity);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, rotateX: -12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.08 + index * 0.1, type: 'spring', stiffness: 220, damping: 22 }}
      className={cn('flex flex-col rounded-2xl border border-white/[0.07] bg-ink-800/70 p-4', active?.stage === 'production' && 'border-emerald-400/30')}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-white">{uc.title}</h3>
        <span className="shrink-0 rounded-lg bg-metric-value/15 px-2 py-1 text-xs font-bold text-amber-200">
          {fmtMoney(uc.value * BALANCE.valueScale)}/q
        </span>
      </div>

      <blockquote className="mt-2 flex gap-2 rounded-xl bg-white/3 p-3 text-sm italic text-ink-200">
        <Quote size={14} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
        <span>
          {uc.ask} <span className="not-italic text-ink-400">({dept.head})</span>
        </span>
      </blockquote>

      <div className="mt-3">
        <div className="label-caps mb-1.5 flex items-center gap-1.5">
          <Eye size={12} aria-hidden /> What your audit found
        </div>
        <ul className="space-y-1.5">
          {uc.clues.map((clue) => (
            <li key={clue} className="flex gap-2 text-sm text-ink-100">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-brand-cyan" aria-hidden />
              <span>{clue}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
        <span className={cn('rounded-full px-2 py-0.5', sens.cls)}>{sens.label}</span>
        <span className="rounded-full bg-white/6 px-2 py-0.5 text-ink-200">{dataNeedLabel(uc.dataRequirement)}</span>
        {uc.customerFacing && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-400/15 px-2 py-0.5 text-sky-200">
            <Globe2 size={11} aria-hidden /> Customer-facing
          </span>
        )}
      </div>

      {past.length > 0 && (
        <p className="mt-3 text-xs text-ink-400">
          Previously tried: {past.map((p) => `${APPROACHES[p.approach].short} (${p.stage})`).join(', ')}
        </p>
      )}

      <div className="mt-4 flex flex-1 items-end">
        {active ? (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => {
              openDept(null);
              openProject(active.id);
            }}
            icon={<ArrowRight size={14} />}
          >
            {APPROACHES[active.approach].short} ·{' '}
            {active.stage === 'pilot' ? 'Piloting' : active.stage === 'results' ? 'Decision needed' : 'Live in production'}
          </Button>
        ) : (
          <Button variant="primary" size="sm" className="w-full" onClick={onTriage} icon={<ArrowRight size={14} />}>
            {past.length ? 'Pivot: triage again' : 'Triage & choose an approach'}
          </Button>
        )}
      </div>
    </motion.article>
  );
}
