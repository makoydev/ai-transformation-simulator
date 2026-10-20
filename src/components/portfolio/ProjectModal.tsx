import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Power, RefreshCw, Rocket, ShieldCheck, Skull, UserCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DebriefCard } from '@/components/feedback/DebriefCard';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DisabledReason } from '@/components/ui/DisabledReason';
import { Meter } from '@/components/ui/Meter';
import { Modal } from '@/components/ui/Modal';
import { APPROACHES } from '@/data/approaches';
import { DEPARTMENTS } from '@/data/departments';
import { BALANCE, getActionCost, sel, validateAction, type GameAction, type GameState, type Project } from '@/engine';
import { cn } from '@/lib/cn';
import { RESULT_STYLE } from '@/lib/labels';
import { fmtCost, fmtMoney } from '@/lib/format';
import { APPROACH_ICONS } from '@/lib/icons';
import { play } from '@/lib/sfx';
import { useGameStore } from '@/store/gameStore';
import { PALETTE } from '@/lib/palette';

export function ProjectModal() {
  const projectId = useGameStore((s) => s.projectModal);
  const game = useGameStore((s) => s.game);
  const openProject = useGameStore((s) => s.openProject);
  const project = game?.projects.find((p) => p.id === projectId) ?? null;
  return (
    <Modal open={!!project} onClose={() => openProject(null)} size="lg" label="Project details">
      {project && game && <ProjectBody key={project.id} game={game} project={project} />}
    </Modal>
  );
}

function Stat({ label, value, sub, className }: { label: string; value: React.ReactNode; sub?: string; className?: string }) {
  return (
    <div className={cn('rounded-xl bg-white/4 p-3', className)}>
      <div className="text-[11px] text-ink-400">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-white">{value}</div>
      {sub && <div className="text-[11px] text-ink-400">{sub}</div>}
    </div>
  );
}

function ProjectBody({ game, project: p }: { game: GameState; project: Project }) {
  const perform = useGameStore((s) => s.perform);
  const openProject = useGameStore((s) => s.openProject);
  const uc = sel.caseOf(p);
  const ap = APPROACHES[p.approach];
  const ApIcon = APPROACH_ICONS[p.approach];

  const act = (action: GameAction, closeAfter = false) => {
    if (perform(action) && closeAfter) openProject(null);
  };
  const costLabel = (action: GameAction) => fmtCost(getActionCost(game, action));

  return (
    <div>
      <div className="border-b border-white/6 p-5 pr-12 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: `${ap.color}22`, color: ap.color }}>
            <ApIcon size={12} className="mr-1 inline" aria-hidden />
            {ap.name}
          </span>
          <span className="text-ink-400">
            {DEPARTMENTS[uc.dept].name} · started Q{p.startedQuarter} · spent {fmtMoney(p.spend)}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-bold text-white">{uc.title}</h2>
        <p className="mt-1 text-sm text-ink-300">“{uc.ask}”</p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {p.stage === 'pilot' && <PilotView game={game} project={p} act={act} costLabel={costLabel} />}
        {p.stage === 'results' && <ResultsView game={game} project={p} act={act} costLabel={costLabel} />}
        {p.stage === 'production' && <ProductionView game={game} project={p} act={act} costLabel={costLabel} />}
        {(p.stage === 'killed' || p.stage === 'retired') && (
          <>
            <div className="flex items-center gap-2 text-ink-200">
              <Skull size={18} aria-hidden /> {p.stage === 'killed' ? 'Killed' : 'Retired'} in Q{p.endedQuarter}. Delivered{' '}
              {fmtMoney(p.valueRealized)} on {fmtMoney(p.spend)} invested.
            </div>
            <ProjectDebrief game={game} project={p} />
          </>
        )}
      </div>
    </div>
  );
}

interface ViewProps {
  game: GameState;
  project: Project;
  act: (a: GameAction, closeAfter?: boolean) => void;
  costLabel: (a: GameAction) => string;
}

function ProjectDebrief({ game, project }: { game: GameState; project: Project }) {
  const debrief = game.debriefs.find((d) => d.id === project.debriefId);
  return debrief ? <DebriefCard debrief={debrief} /> : null;
}

function PilotView({ game, project: p, act }: ViewProps) {
  const [confirmKill, setConfirmKill] = useState(false);
  const total = p.iterations > 0 ? 1 : APPROACHES[p.approach].pilotQuarters;
  const refund = sel.killRefund(p);
  return (
    <>
      <div>
        <div className="mb-1.5 flex justify-between text-sm text-ink-200">
          <span>Pilot in progress{p.iterations > 0 ? ` (iteration ${p.iterations + 1})` : ''}</span>
          <span>
            Results in {p.quartersRemaining} quarter{p.quartersRemaining === 1 ? '' : 's'}
          </span>
        </div>
        <Meter value={total - p.quartersRemaining} max={total} color={PALETTE.hue.sky} height="h-2.5" label="Pilot progress" />
      </div>
      <p className="text-sm text-ink-300">
        The team is building and testing against success criteria. You'll see the results, and a debrief on whether this
        approach fit the problem, when the pilot completes at quarter end.
      </p>
      <div className="flex flex-wrap gap-2 border-t border-white/6 pt-4">
        <Button
          variant="danger"
          onClick={() => setConfirmKill(true)}
          disabled={!!validateAction(game, { type: 'kill', projectId: p.id })}
          icon={<Skull size={15} />}
        >
          Kill pilot (refund {fmtMoney(refund)})
        </Button>
      </div>
      <ConfirmDialog
        open={confirmKill}
        title="Kill this pilot?"
        message={`The pilot stops now and you get ${fmtMoney(refund)} back. Trying this use case again means starting a new pilot.`}
        confirmLabel="Kill pilot"
        onCancel={() => setConfirmKill(false)}
        onConfirm={() => {
          setConfirmKill(false);
          act({ type: 'kill', projectId: p.id }, true);
        }}
      />
    </>
  );
}

function ResultsView({ game, project: p, act, costLabel }: ViewProps) {
  const revealed = useGameStore((s) => s.revealed.includes(p.id));
  const markRevealed = useGameStore((s) => s.markRevealed);
  const [phase, setPhase] = useState<'analyzing' | 'stamp' | 'done'>(revealed ? 'done' : 'analyzing');
  const uc = sel.caseOf(p);
  const sensitive = uc.sensitivity >= 0.7 && p.approach !== 'process';
  const [hitl, setHitl] = useState(sensitive);
  const [confirmKill, setConfirmKill] = useState(false);
  const result = p.result!;

  // Runs once per reveal: both timers must survive the phase change they trigger.
  const startedRevealed = useRef(revealed);
  useEffect(() => {
    if (startedRevealed.current) return;
    const t1 = setTimeout(() => {
      setPhase('stamp');
      play(result === 'failed' ? 'fail' : 'stamp');
    }, 1300);
    const t2 = setTimeout(() => {
      setPhase('done');
      markRevealed(p.id);
    }, 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [result, markRevealed, p.id]);

  const scaleAction: GameAction = { type: 'scale', projectId: p.id, hitl };
  const iterateAction: GameAction = { type: 'iterate', projectId: p.id };
  const killAction: GameAction = { type: 'kill', projectId: p.id };
  const projected = sel.potentialValue({ ...p, hitl: p.approach === 'process' ? false : hitl });
  const runCost = sel.runCostOf(uc, p.approach);
  const stalled = p.stalledQuarters >= 1;
  const decideNow = !stalled && p.resultsQuarter !== null && p.resultsQuarter < game.quarter;

  if (phase === 'analyzing') {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="label-caps">Analyzing pilot results</div>
        <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-brand-gradient" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.25, ease: 'easeInOut' }} />
        </div>
        <motion.p className="mt-4 text-sm text-ink-300" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
          Comparing against baseline KPIs…
        </motion.p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <motion.div
          initial={phase === 'stamp' ? { scale: 2.4, rotate: -18, opacity: 0 } : false}
          animate={{ scale: 1, rotate: -6, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className={cn('rounded-xl border-2 px-4 py-2 font-display text-2xl font-black uppercase tracking-widest', RESULT_STYLE[result].cls)}
        >
          {RESULT_STYLE[result].label}
        </motion.div>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="Projected value at full adoption" value={`${fmtMoney(projected)}/q`} />
          <Stat label="Run cost in production" value={`${fmtMoney(runCost)}/q`} />
          <Stat label="Opportunity size" value={`${fmtMoney(uc.value * BALANCE.valueScale)}/q`} sub="with the ideal approach" className="col-span-2 sm:col-span-1" />
        </div>
      </div>

      {stalled && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          In PoC purgatory: waiting for a decision since Q{p.resultsQuarter}. Every quarter it sits here costs board trust.
        </div>
      )}
      {decideNow && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          Decide this quarter: if this pilot is still undecided at quarter end, it falls into PoC purgatory.
        </div>
      )}

      <AnimatePresence>
        {phase === 'done' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <ProjectDebrief game={game} project={p} />

            <div className="rounded-2xl border border-white/[0.07] bg-ink-800/60 p-4">
              <div className="label-caps mb-3">Your decision</div>
              {result !== 'failed' && p.approach !== 'process' && (
                <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-xl bg-white/4 p-3">
                  <input type="checkbox" checked={hitl} onChange={(e) => setHitl(e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-400" />
                  <span className="text-sm">
                    <span className="flex items-center gap-1.5 font-semibold text-white">
                      <UserCheck size={15} aria-hidden /> Human-in-the-loop review
                    </span>
                    <span className="text-ink-300">
                      Humans approve high-stakes outputs. Risk ×{BALANCE.hitlRiskFactor}, value ×{BALANCE.hitlValueFactor}, slight
                      adoption boost.
                      {sensitive ? ' Recommended: this use case has high stakes.' : ' Optional for lower-stakes work.'}
                    </span>
                  </span>
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                {result !== 'failed' && (
                  <Button
                    variant="success"
                    onClick={() => act(scaleAction, true)}
                    disabled={!!validateAction(game, scaleAction)}
                    icon={<Rocket size={16} />}
                  >
                    Scale to production · {costLabel(scaleAction)}
                  </Button>
                )}
                {result !== 'success' && (
                  <Button
                    variant="warning"
                    onClick={() => act(iterateAction, true)}
                    disabled={!!validateAction(game, iterateAction)}
                    icon={<RefreshCw size={16} />}
                  >
                    Iterate (+15% odds) · {costLabel(iterateAction)}
                  </Button>
                )}
                <Button variant="danger" onClick={() => setConfirmKill(true)} icon={<Skull size={16} />}>
                  Kill it
                </Button>
              </div>
              <DisabledReason
                className="mt-2"
                reasons={[
                  result !== 'failed' ? validateAction(game, scaleAction) : null,
                  result !== 'success' ? validateAction(game, iterateAction) : null,
                ]}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={confirmKill}
        title="Kill this pilot?"
        message={`${uc.title} ends here, and nothing is refunded. Trying this use case again means starting a new pilot.`}
        confirmLabel="Kill pilot"
        onCancel={() => setConfirmKill(false)}
        onConfirm={() => {
          setConfirmKill(false);
          act(killAction, true);
        }}
      />
    </>
  );
}

function ProductionView({ game, project: p, act, costLabel }: ViewProps) {
  const [confirmRetire, setConfirmRetire] = useState(false);
  const uc = sel.caseOf(p);
  const toggle: GameAction = { type: 'toggleHitl', projectId: p.id };
  const retire: GameAction = { type: 'retire', projectId: p.id };
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Value now" value={`${fmtMoney(sel.projectValue(p))}/q`} sub={`of ${fmtMoney(sel.potentialValue(p))} potential`} />
        <Stat label="Delivered so far" value={fmtMoney(p.valueRealized)} sub={`on ${fmtMoney(p.spend)} invested`} />
        <Stat label="Run cost" value={`${fmtMoney(sel.runCostOf(uc, p.approach))}/q`} />
        <Stat label="Risk contribution" value={Math.round(sel.projectRisk(game, p) * sel.scenarioOf(game).regulation)} sub="points of exposure" />
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-sm text-ink-200">
          <span>Adoption</span>
          <span className="font-semibold text-white">{Math.round(p.adoption)}%</span>
        </div>
        <Meter value={p.adoption} color={PALETTE.metric.adoption} height="h-2.5" label="Adoption" />
        <p className="mt-2 text-xs text-ink-400">
          {game.departments[uc.dept].champions ? 'AI champions are accelerating adoption here. ' : 'Tip: recruit AI champions in this department to speed adoption. '}
          {game.literacy === 0 && 'Company-wide AI literacy training also helps.'}
        </p>
      </div>
      <ProjectDebrief game={game} project={p} />
      <div className="flex flex-wrap gap-2 border-t border-white/6 pt-4">
        {p.approach !== 'process' && (
          <Button variant="secondary" onClick={() => act(toggle)} disabled={!!validateAction(game, toggle)} icon={<ShieldCheck size={15} />}>
            {p.hitl ? 'Disable' : 'Enable'} human-in-the-loop · {costLabel(toggle)}
          </Button>
        )}
        <Button variant="danger" onClick={() => setConfirmRetire(true)} icon={<Power size={15} />}>
          Retire system
        </Button>
        {p.approach !== 'process' && <DisabledReason className="w-full" reasons={[validateAction(game, toggle)]} />}
      </div>
      <ConfirmDialog
        open={confirmRetire}
        title="Retire this system?"
        message={`${uc.title} stops delivering ${fmtMoney(sel.projectValue(p))}/q, and its ${fmtMoney(sel.runCostOf(uc, p.approach))}/q run cost stops too. Bringing it back means starting a new pilot.`}
        confirmLabel="Retire system"
        onCancel={() => setConfirmRetire(false)}
        onConfirm={() => {
          setConfirmRetire(false);
          act(retire, true);
        }}
      />
    </>
  );
}
