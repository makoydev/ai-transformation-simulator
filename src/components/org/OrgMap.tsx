import { motion } from 'framer-motion';
import { Lock, Sparkles, Users } from 'lucide-react';
import { Meter } from '@/components/ui/Meter';
import { DEPARTMENTS, DEPT_ORDER } from '@/data/departments';
import { useCasesForDept } from '@/data/useCases';
import { BALANCE, sel, type DeptId } from '@/engine';
import { cn } from '@/lib/cn';
import { DEPT_ICONS } from '@/lib/icons';
import { useGame, useGameStore } from '@/store/gameStore';

const STATUS_STYLE: Record<sel.UseCaseStatus, { dot: string; label: string }> = {
  undiscovered: { dot: 'bg-ink-500', label: 'Unknown' },
  discovered: { dot: 'bg-ink-200', label: 'Discovered' },
  pilot: { dot: 'bg-[#6fa8c9]', label: 'Piloting' },
  results: { dot: 'bg-[#d6ab5e]', label: 'Decision needed' },
  production: { dot: 'bg-[#6db894]', label: 'Live' },
};

export function OrgMap() {
  const game = useGame();
  const audited = DEPT_ORDER.filter((d) => game.departments[d].audited).length;
  return (
    <section aria-labelledby="org-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="org-title" className="text-xl font-bold text-white">
            Org Map
          </h2>
          <p className="text-sm text-ink-300">
            Audit departments to discover use cases, check data readiness, and spot process problems disguised as AI problems.
          </p>
        </div>
        <span className="label-caps">
          {audited}/{DEPT_ORDER.length} audited
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DEPT_ORDER.map((id, i) => (
          <DepartmentCard key={id} id={id} index={i} />
        ))}
      </div>
    </section>
  );
}

function DepartmentCard({ id, index }: { id: DeptId; index: number }) {
  const game = useGame();
  const openDept = useGameStore((s) => s.openDept);
  const def = DEPARTMENTS[id];
  const dept = game.departments[id];
  const Icon = DEPT_ICONS[id];
  const useCases = useCasesForDept(id);
  const needsDecision = useCases.some((uc) => sel.useCaseStatus(game, uc) === 'results');

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => openDept(id)}
      className={cn(
        'glass group relative flex min-h-[200px] flex-col overflow-hidden p-4 text-left transition-colors hover:border-white/20',
        needsDecision && 'border-amber-300/40',
      )}
    >
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: def.color }}
        aria-hidden
      />
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${def.color}22`, color: def.color }}
        >
          <Icon size={20} aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-white">{def.name}</h3>
          <p className="truncate text-xs text-ink-300">
            {def.head}, {def.headTitle}
          </p>
        </div>
      </div>

      {!dept.audited ? (
        <div className="mt-3 flex flex-1 flex-col">
          <p className="text-sm leading-relaxed text-ink-300">{def.blurb}</p>
          <div className="mt-auto flex items-center gap-2 pt-4 text-xs font-semibold text-brand-cyan">
            <Lock size={13} aria-hidden />
            Audit to reveal {useCases.length} use cases · 1 capacity · ${Math.round(BALANCE.auditCost * 1000)}K
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-1 flex-col gap-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-ink-300">
              <span>Data readiness</span>
              <span className="font-semibold text-white">{dept.dataReadiness}/100</span>
            </div>
            <Meter value={dept.dataReadiness} color={def.color} label={`${def.name} data readiness`} />
          </div>
          <ul className="space-y-1.5">
            {useCases.map((uc) => {
              const status = sel.useCaseStatus(game, uc);
              const st = STATUS_STYLE[status];
              return (
                <li key={uc.id} className="flex items-center gap-2 text-xs">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', st.dot)} aria-hidden />
                  <span className="truncate text-ink-100">{uc.title}</span>
                  <span className="ml-auto shrink-0 text-ink-400">{st.label}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex flex-wrap gap-1.5">
            {dept.champions && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-400/15 px-2 py-0.5 text-[11px] font-semibold text-pink-200">
                <Users size={11} aria-hidden /> Champions
              </span>
            )}
            {needsDecision && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/15 px-2 py-0.5 text-[11px] font-semibold text-amber-100">
                <Sparkles size={11} aria-hidden /> Results in
              </span>
            )}
          </div>
        </div>
      )}
    </motion.button>
  );
}
