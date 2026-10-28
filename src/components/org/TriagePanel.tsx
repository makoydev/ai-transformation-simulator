import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Check, Clock, Coins, Eye, Lightbulb, Rocket, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DisabledReason } from '@/components/ui/DisabledReason';
import { APPROACHES, APPROACH_ORDER } from '@/data/approaches';
import type { UseCaseDef } from '@/data/useCases';
import { sel, validateAction, type ApproachId } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtMoney } from '@/lib/format';
import { APPROACH_ICONS } from '@/lib/icons';
import { rovingKeyDown, rovingTabIndex } from '@/lib/roving';
import { useGameStore } from '@/store/gameStore';

function riskTier(weight: number): { label: string; cls: string } {
  if (weight === 0) return { label: 'No model risk', cls: 'text-emerald-300' };
  if (weight < 0.25) return { label: 'Low risk', cls: 'text-emerald-300' };
  if (weight < 0.5) return { label: 'Medium risk', cls: 'text-amber-200' };
  return { label: 'High risk', cls: 'text-rose-300' };
}

const quarters = (n: number) => `${n} quarter${n > 1 ? 's' : ''}`;

interface Props {
  useCase: UseCaseDef;
  onBack: () => void;
  onLaunched: () => void;
}

export function TriagePanel({ useCase: uc, onBack, onLaunched }: Props) {
  const game = useGameStore((s) => s.game)!;
  const perform = useGameStore((s) => s.perform);
  const [selected, setSelected] = useState<ApproachId | null>(null);
  const [view, setView] = useState<'cards' | 'compare'>('cards');
  const readiness = game.departments[uc.dept].dataReadiness;

  const launch = () => {
    if (!selected) return;
    if (perform({ type: 'launchPilot', useCaseId: uc.id, approach: selected })) onLaunched();
  };

  const reason = selected ? validateAction(game, { type: 'launchPilot', useCaseId: uc.id, approach: selected }) : null;

  // Everything both views show about each approach for this use case.
  const facts = APPROACH_ORDER.map((id) => {
    const required = sel.readinessRequired(uc, id);
    const gap = sel.readinessGap(game, uc, id);
    const data =
      required === 0
        ? { long: 'No data dependency', short: 'None needed', cls: 'bg-white/4 text-ink-300', text: 'text-ink-300' }
        : gap === 0
          ? { long: `Data ready (needs ~${required}, have ${readiness})`, short: 'Ready', cls: 'bg-emerald-400/10 text-emerald-200', text: 'text-emerald-200' }
          : { long: `Data gap: needs ~${required}, have ${readiness}`, short: `Gap: needs ~${required}`, cls: 'bg-rose-400/10 text-rose-200', text: 'text-rose-200' };
    return {
      id,
      ap: APPROACHES[id],
      pilotCost: sel.pilotCost(uc, id),
      prodCost: sel.prodCost(uc, id),
      runCost: sel.runCostOf(uc, id),
      risk: riskTier(APPROACHES[id].riskWeight * uc.sensitivity),
      data,
    };
  });

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
      {/* The clues are what the choice rests on, so they are at least as prominent here as on the use-case card. */}
      <div className="mt-3 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 p-3">
        <div className="label-caps mb-1.5 flex items-center gap-1.5">
          <Eye size={12} aria-hidden /> What your audit found
        </div>
        <ul className="space-y-1.5">
          {uc.clues.map((c) => (
            <li key={c} className="flex gap-2 text-sm text-ink-100">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-brand-cyan" aria-hidden />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="label-caps">Choose an approach</div>
        <div className="flex rounded-xl bg-white/4 p-1 text-xs" role="group" aria-label="View">
          {(['cards', 'compare'] as const).map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn('rounded-lg px-3 py-1.5 font-semibold transition', view === v ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white')}
            >
              {v === 'cards' ? 'Cards' : 'Compare'}
            </button>
          ))}
        </div>
      </div>

      {view === 'cards' ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Approach" onKeyDown={rovingKeyDown}>
          {facts.map((f, i) => {
            const { id, ap } = f;
            const Icon = APPROACH_ICONS[id];
            const isSel = selected === id;
            return (
              <motion.button
                key={id}
                role="radio"
                aria-checked={isSel}
                tabIndex={rovingTabIndex(isSel, i, selected !== null)}
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
                <p className="mt-2.5 text-xs text-ink-200">
                  <span className="font-semibold text-emerald-200">Best for:</span> {ap.bestFor}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 text-ink-200">
                    <Coins size={12} aria-hidden /> Pilot {fmtMoney(f.pilotCost)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-ink-200">
                    <Clock size={12} aria-hidden /> {quarters(ap.pilotQuarters)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-ink-200">
                    <Rocket size={12} aria-hidden /> Scale {fmtMoney(f.prodCost)}
                  </span>
                  <span className={cn('inline-flex items-center gap-1', f.risk.cls)}>
                    <ShieldAlert size={12} aria-hidden /> {f.risk.label}
                  </span>
                </div>
                <div className={cn('mt-2 rounded-lg px-2 py-1 text-xs', f.data.cls)}>{f.data.long}</div>
                <div className="mt-2 text-xs text-ink-400">Run cost {fmtMoney(f.runCost)}/q in production</div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        // A compact table for comparing all six at once. It scrolls sideways inside itself on narrow screens.
        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/[0.07]" role="radiogroup" aria-label="Approach" onKeyDown={rovingKeyDown}>
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-white/4 text-ink-300">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">Approach</th>
                <th scope="col" className="px-3 py-2 font-semibold">Pilot</th>
                <th scope="col" className="px-3 py-2 font-semibold">Time</th>
                <th scope="col" className="px-3 py-2 font-semibold">Scale</th>
                <th scope="col" className="px-3 py-2 font-semibold">Run cost</th>
                <th scope="col" className="px-3 py-2 font-semibold">Risk</th>
                <th scope="col" className="px-3 py-2 font-semibold">Data fit</th>
              </tr>
            </thead>
            <tbody>
              {facts.map((f, i) => {
                const { id, ap } = f;
                const Icon = APPROACH_ICONS[id];
                const isSel = selected === id;
                return (
                  <tr
                    key={id}
                    onClick={() => setSelected(id)}
                    className={cn('cursor-pointer border-t border-white/6 text-ink-200 transition-colors', isSel ? 'bg-white/8' : 'hover:bg-white/4')}
                    style={isSel ? { boxShadow: `inset 3px 0 0 ${ap.color}` } : undefined}
                  >
                    <th scope="row" className="px-3 py-2.5 font-normal">
                      <button
                        role="radio"
                        aria-checked={isSel}
                        tabIndex={rovingTabIndex(isSel, i, selected !== null)}
                        onClick={() => setSelected(id)}
                        className="flex items-center gap-2 text-left">
                        <Icon size={15} style={{ color: ap.color }} className="shrink-0" aria-hidden />
                        <span className="font-semibold text-white">{ap.name}</span>
                        {isSel && <Check size={13} className="shrink-0 text-white" aria-hidden />}
                      </button>
                    </th>
                    <td className="px-3 py-2.5">{fmtMoney(f.pilotCost)}</td>
                    <td className="px-3 py-2.5">{quarters(ap.pilotQuarters)}</td>
                    <td className="px-3 py-2.5">{fmtMoney(f.prodCost)}</td>
                    <td className="px-3 py-2.5">{fmtMoney(f.runCost)}/q</td>
                    <td className={cn('px-3 py-2.5', f.risk.cls)}>{f.risk.label}</td>
                    <td className={cn('px-3 py-2.5', f.data.text)}>{f.data.short}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 mt-5 border-t border-white/6 bg-ink-850/95 px-5 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        {selected ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-ink-200">
              Launch a <span className="font-semibold text-white">{APPROACHES[selected].name}</span> pilot ·{' '}
              {fmtMoney(sel.pilotCost(uc, selected))} · 1 capacity · results in {quarters(APPROACHES[selected].pilotQuarters)}
              <p className="mt-1 text-xs text-ink-300">
                <span className="font-semibold text-amber-200">Watch out:</span> {APPROACHES[selected].watchOut}
              </p>
            </div>
            {sel.readinessGap(game, uc, selected) > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-200">
                <AlertTriangle size={13} aria-hidden /> Data gap lowers success odds. Consider a data sprint first.
              </span>
            )}
            <div className="ml-auto flex flex-col items-end gap-1">
              <Button variant="primary" disabled={!!reason} onClick={launch} icon={<Rocket size={16} />}>
                Launch pilot
              </Button>
              <DisabledReason reasons={[reason]} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-400">Select an approach to continue.</p>
        )}
      </div>
    </div>
  );
}
