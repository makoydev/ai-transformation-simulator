import { AnimatePresence, motion } from 'framer-motion';
import { Database, Search, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Meter } from '@/components/ui/Meter';
import { Modal } from '@/components/ui/Modal';
import { DEPARTMENTS } from '@/data/departments';
import { STAKEHOLDERS } from '@/data/stakeholders';
import { useCasesForDept, type UseCaseDef } from '@/data/useCases';
import { BALANCE, getActionCost, validateAction, type GameAction } from '@/engine';
import { fmtMoney } from '@/lib/format';
import { DEPT_ICONS } from '@/lib/icons';
import { useGameStore } from '@/store/gameStore';
import { TriagePanel } from './TriagePanel';
import { UseCaseCard } from './UseCaseCard';

export function DepartmentModal() {
  const deptId = useGameStore((s) => s.deptModal);
  const openDept = useGameStore((s) => s.openDept);
  const [triage, setTriage] = useState<UseCaseDef | null>(null);

  const close = () => {
    setTriage(null);
    openDept(null);
  };

  return (
    <Modal open={deptId !== null} onClose={close} size="xl" label={deptId ? DEPARTMENTS[deptId].name : 'Department'}>
      {deptId && <DepartmentBody deptId={deptId} triage={triage} setTriage={setTriage} />}
    </Modal>
  );
}

function DepartmentBody({
  deptId,
  triage,
  setTriage,
}: {
  deptId: keyof typeof DEPARTMENTS;
  triage: UseCaseDef | null;
  setTriage: (uc: UseCaseDef | null) => void;
}) {
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
      <Button size="sm" variant="secondary" disabled={!!reason} title={reason ?? undefined} onClick={() => perform(action)} icon={icon}>
        {label} · {fmtMoney(cost.budget)}
      </Button>
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
          <div className="relative mt-4 flex flex-wrap gap-2">
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
                <TriagePanel useCase={triage} onBack={() => setTriage(null)} onLaunched={() => setTriage(null)} />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="grid gap-4 lg:grid-cols-2">
                {useCases.map((uc, i) => (
                  <UseCaseCard key={uc.id} useCase={uc} index={i} onTriage={() => setTriage(uc)} />
                ))}
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
        Audit · 1 capacity · {fmtMoney(BALANCE.auditCost)}
      </Button>
      {reason && <p className="mt-2 text-xs text-rose-300">{reason}</p>}
    </div>
  );
}
