import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Database, Search, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DisabledReason } from '@/components/ui/DisabledReason';
import { Meter } from '@/components/ui/Meter';
import { Modal } from '@/components/ui/Modal';
import { DEPARTMENTS } from '@/data/departments';
import { STAKEHOLDERS } from '@/data/stakeholders';
import { useCasesForDept, type UseCaseDef } from '@/data/useCases';
import { BALANCE, getActionCost, validateAction, type GameAction } from '@/engine';
import { fmtCost } from '@/lib/format';
import { DEPT_ICONS } from '@/lib/icons';
import { useGameStore } from '@/store/gameStore';
import { TriagePanel } from './TriagePanel';
import { UseCaseCard } from './UseCaseCard';

export function DepartmentModal() {
  const deptId = useGameStore((s) => s.deptModal);
  const openDept = useGameStore((s) => s.openDept);

  return (
    <Modal open={deptId !== null} onClose={() => openDept(null)} size="xl" label={deptId ? DEPARTMENTS[deptId].name : 'Department'}>
      {/* Keyed by department so triage state resets whenever the modal closes or switches departments. */}
      {deptId && <DepartmentBody key={deptId} deptId={deptId} />}
    </Modal>
  );
}

function DepartmentBody({ deptId }: { deptId: keyof typeof DEPARTMENTS }) {
  const [triage, setTriage] = useState<UseCaseDef | null>(null);
  // The confirmation after a launch, shown above the use-case list until the next triage.
  const [launched, setLaunched] = useState<string | null>(null);
  const openDept = useGameStore((s) => s.openDept);
  const setTab = useGameStore((s) => s.setTab);
  const game = useGameStore((s) => s.game)!;
  const perform = useGameStore((s) => s.perform);
  const def = DEPARTMENTS[deptId];
  const dept = game.departments[deptId];
  const Icon = DEPT_ICONS[deptId];
  const useCases = useCasesForDept(deptId);
  const sponsor = STAKEHOLDERS[def.sponsor];
  const rootRef = useRef<HTMLDivElement>(null);

  // Switching between the use-case list and triage starts at the top of the dialog.
  useEffect(() => {
    rootRef.current?.closest('[role="dialog"]')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [triage]);

  const actionButton = (action: GameAction, label: string, icon: React.ReactNode) => {
    const cost = getActionCost(game, action);
    const reason = validateAction(game, action);
    return (
      <div className="flex flex-col gap-1">
        <Button size="sm" variant="secondary" disabled={!!reason} onClick={() => perform(action)} icon={icon}>
          {label} · {fmtCost(cost)}
        </Button>
        <DisabledReason reasons={[reason]} />
      </div>
    );
  };

  return (
    <div ref={rootRef}>
      <div className="relative overflow-hidden border-b border-white/6 p-5 pr-12 sm:p-6 sm:pr-14">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: def.color }} aria-hidden />
        <div className="relative flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${def.color}22`, color: def.color }}>
            <Icon size={24} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-white">{def.name}</h2>
            <p className="text-sm text-ink-300">
              {def.head}, {def.headTitle} · Executive sponsor: {sponsor.name} ({sponsor.title})
            </p>
            <p className="mt-2 max-w-2xl text-sm text-ink-200">{def.blurb}</p>
          </div>
          {dept.audited && (
            <div className="w-full sm:w-56">
              <div className="mb-1 flex justify-between text-xs text-ink-300">
                <span>Data readiness</span>
                <span className="font-semibold text-white">{dept.dataReadiness}/100</span>
              </div>
              <Meter value={dept.dataReadiness} color={def.color} height="h-2" label="Data readiness" />
            </div>
          )}
        </div>
        {dept.audited && !triage && (
          <div className="relative mt-4 flex flex-wrap items-start gap-2">
            {actionButton({ type: 'dataSprint', dept: deptId }, `Data sprint (+${BALANCE.dataSprintGain} readiness)`, <Database size={14} />)}
            {!dept.champions
              ? actionButton({ type: 'champions', dept: deptId }, 'Recruit AI champions', <Users size={14} />)
              : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-pink-400/15 px-3 text-xs font-semibold text-pink-200">
                  <Users size={14} aria-hidden /> AI champions active: faster adoption here
                </span>
              )}
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {!dept.audited ? (
          <AuditPrompt deptId={deptId} count={useCases.length} />
        ) : (
          <AnimatePresence mode="wait">
            {triage ? (
              <motion.div key="triage" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <TriagePanel
                  useCase={triage}
                  onBack={() => setTriage(null)}
                  onLaunched={(summary) => {
                    setTriage(null);
                    setLaunched(summary);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                {launched && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2 pl-3 pr-1 text-sm text-emerald-100">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden />
                    <div className="min-w-0 flex-1">
                      {launched}.{' '}
                      <button
                        onClick={() => {
                          openDept(null);
                          setTab('portfolio');
                        }}
                        className="font-semibold text-emerald-200 underline-offset-2 hover:underline"
                      >
                        Track it in the Portfolio
                      </button>
                    </div>
                    <button
                      onClick={() => setLaunched(null)}
                      aria-label="Dismiss"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-200 hover:bg-white/10"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  </div>
                )}
                <div className="grid gap-4 lg:grid-cols-2">
                  {useCases.map((uc, i) => (
                    <UseCaseCard
                      key={uc.id}
                      useCase={uc}
                      index={i}
                      onTriage={() => {
                        setLaunched(null);
                        setTriage(uc);
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function AuditPrompt({ deptId, count }: { deptId: keyof typeof DEPARTMENTS; count: number }) {
  const game = useGameStore((s) => s.game)!;
  const perform = useGameStore((s) => s.perform);
  const action: GameAction = { type: 'audit', dept: deptId };
  const reason = validateAction(game, action);
  return (
    <div className="grid-bg flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1 }}>
        <Search size={40} className="text-brand-cyan" aria-hidden />
      </motion.div>
      <h3 className="mt-4 text-lg font-semibold text-white">Run a discovery audit</h3>
      <p className="mt-1 max-w-md text-sm text-ink-300">
        Interview the team, map their workflows, and inspect their data. You'll uncover {count} candidate use cases and
        this department's true data readiness.
      </p>
      <Button
        className="mt-6"
        variant="primary"
        size="lg"
        disabled={!!reason}
        onClick={() => perform(action)}
        icon={<Search size={18} />}
      >
        Audit · {fmtCost(getActionCost(game, action))}
      </Button>
      {reason && <p className="mt-2 text-xs text-rose-300">{reason}</p>}
    </div>
  );
}
