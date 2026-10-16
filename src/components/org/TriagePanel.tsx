import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Check, Clock, Coins, Rocket, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { APPROACHES, APPROACH_ORDER } from '@/data/approaches';
import type { UseCaseDef } from '@/data/useCases';
import { sel, validateAction, type ApproachId } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtMoney } from '@/lib/format';
import { APPROACH_ICONS } from '@/lib/icons';
import { useGameStore } from '@/store/gameStore';

function riskTier(weight: number): { label: string; cls: string } {
  if (weight === 0) return { label: 'No model risk', cls: 'text-emerald-300' };
  if (weight < 0.25) return { label: 'Low risk', cls: 'text-emerald-300' };
  if (weight < 0.5) return { label: 'Medium risk', cls: 'text-amber-200' };
  return { label: 'High risk', cls: 'text-rose-300' };
}

interface Props {
  useCase: UseCaseDef;
  onBack: () => void;
  onLaunched: () => void;
}

export function TriagePanel({ useCase: uc, onBack, onLaunched }: Props) {
  const game = useGameStore((s) => s.game)!;
  const perform = useGameStore((s) => s.perform);
  const [selected, setSelected] = useState<ApproachId | null>(null);
  const readiness = game.departments[uc.dept].dataReadiness;

  const launch = () => {
    if (!selected) return;
    if (perform({ type: 'launchPilot', useCaseId: uc.id, approach: selected })) onLaunched();
  };

  const reason = selected ? validateAction(game, { type: 'launchPilot', useCaseId: uc.id, approach: selected }) : null;

  return (
    <div>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white">
        <ArrowLeft size={15} /> Back to use cases
      </button>
      <h3 className="text-xl font-bold text-white">Triage: {uc.title}</h3>
      <p className="mt-1 max-w-3xl text-sm text-ink-300">
        Which approach fits the shape of this problem? Think about whether the output is text, a number, or an action;
        where the knowledge lives; and whether the real issue is the process itself. You'll learn how good your call was
        when the pilot reports back.
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-300">
        {uc.clues.map((c) => (
          <li key={c} className="before:mr-1.5 before:text-brand-cyan before:content-['•']">
            {c}
          </li>
        ))}
      </ul>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Approach">
        {APPROACH_ORDER.map((id, i) => {
          const ap = APPROACHES[id];
          const Icon = APPROACH_ICONS[id];
          const required = sel.readinessRequired(uc, id);
          const gap = sel.readinessGap(game, uc, id);
          const risk = riskTier(ap.riskWeight * uc.sensitivity);
          const isSel = selected === id;
          return (
            <motion.button
              key={id}
              role="radio"
              aria-checked={isSel}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, scale: isSel ? 1.02 : 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 28 }}
              whileHover={{ y: -3 }}
              onClick={() => setSelected(id)}
              className={cn(
                'relative flex flex-col rounded-2xl border p-4 text-left transition-colors',
                isSel ? 'border-transparent bg-ink-700' : 'border-white/[0.07] bg-ink-800/70 hover:border-white/20',
              )}
              style={isSel ? { boxShadow: `0 0 0 2px ${ap.color}, 0 12px 40px -12px ${ap.color}` } : undefined}
            >
              {isSel && (
                <motion.span
                  layoutId="approach-check"
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: ap.color }}
                >
                  <Check size={14} className="text-ink-950" />
                </motion.span>
              )}
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${ap.color}22`, color: ap.color }}>
                  <Icon size={18} aria-hidden />
                </span>
                <div>
                  <div className="font-display font-semibold text-white">{ap.name}</div>
                  <div className="text-xs text-ink-300">{ap.tagline}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                <span className="inline-flex items-center gap-1 text-ink-200">
                  <Coins size={12} aria-hidden /> Pilot {fmtMoney(sel.pilotCost(uc, id))}
                </span>
                <span className="inline-flex items-center gap-1 text-ink-200">
                  <Clock size={12} aria-hidden /> {ap.pilotQuarters} quarter{ap.pilotQuarters > 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1 text-ink-200">
                  <Rocket size={12} aria-hidden /> Scale {fmtMoney(sel.prodCost(uc, id))}
                </span>
                <span className={cn('inline-flex items-center gap-1', risk.cls)}>
                  <ShieldAlert size={12} aria-hidden /> {risk.label}
                </span>
              </div>
              <div
                className={cn(
                  'mt-2 rounded-lg px-2 py-1 text-xs',
                  required === 0 ? 'bg-white/4 text-ink-300' : gap === 0 ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-400/10 text-rose-200',
                )}
              >
                {required === 0
                  ? 'No data dependency'
                  : gap === 0
                    ? `Data ready (needs ~${required}, have ${readiness})`
                    : `Data gap: needs ~${required}, have ${readiness}`}
              </div>
              <div className="mt-2 text-xs text-ink-400">Run cost {fmtMoney(sel.runCostOf(uc, id))}/q in production</div>
              <AnimatePresence>
                {isSel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-xs text-ink-200">
                      <span className="font-semibold text-emerald-200">Best for:</span> {ap.bestFor}
                    </p>
                    <p className="mt-1 text-xs text-ink-200">
                      <span className="font-semibold text-amber-200">Watch out:</span> {ap.watchOut}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-5 border-t border-white/6 bg-ink-850/95 px-5 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        {selected ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-ink-200">
              Launch a <span className="font-semibold text-white">{APPROACHES[selected].name}</span> pilot ·{' '}
              {fmtMoney(sel.pilotCost(uc, selected))} · 1 capacity · results in {APPROACHES[selected].pilotQuarters} quarter
              {APPROACHES[selected].pilotQuarters > 1 ? 's' : ''}
            </div>
            {sel.readinessGap(game, uc, selected) > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-200">
                <AlertTriangle size={13} aria-hidden /> Data gap lowers success odds. Consider a data sprint first.
              </span>
            )}
            <Button variant="primary" className="ml-auto" disabled={!!reason} onClick={launch} icon={<Rocket size={16} />}>
              {reason ?? 'Launch pilot'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-ink-400">Select an approach to continue.</p>
        )}
      </div>
    </div>
  );
}
