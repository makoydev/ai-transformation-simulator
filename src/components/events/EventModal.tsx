import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, ArrowRight, Lightbulb, Scale, Siren, Sparkles, type LucideIcon } from 'lucide-react';
import { DebriefCard } from '@/components/feedback/DebriefCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ChangeChips } from '@/components/ui/ChangeChips';
import { Modal } from '@/components/ui/Modal';
import { choiceDescription, EVENT_MAP, type EventCategory } from '@/data/events';
import { STAKEHOLDERS } from '@/data/stakeholders';
import { BALANCE, currentEvent, isChoiceAvailable, sel, type GameState } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtMoney, quarterLabel } from '@/lib/format';
import { useGameStore } from '@/store/gameStore';
import { PALETTE } from '@/lib/palette';

const CATEGORY: Record<EventCategory, { label: string; icon: LucideIcon; cls: string; glow: string }> = {
  crisis: { label: 'Crisis', icon: Siren, cls: 'bg-rose-500/15 text-rose-200 border-rose-400/30', glow: PALETTE.hue.rose },
  incident: { label: 'Incident', icon: AlertOctagon, cls: 'bg-red-500/20 text-red-200 border-red-400/40', glow: PALETTE.hue.red },
  opportunity: { label: 'Opportunity', icon: Sparkles, cls: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30', glow: PALETTE.hue.green },
  dilemma: { label: 'Dilemma', icon: Scale, cls: 'bg-amber-300/15 text-amber-100 border-amber-300/30', glow: PALETTE.hue.amber },
};

export function EventModal() {
  const game = useGameStore((s) => s.game);
  const outcome = useGameStore((s) => s.eventOutcome);
  const transition = useGameStore((s) => s.transition);
  const howTo = useGameStore((s) => s.howTo);
  const chooseEvent = useGameStore((s) => s.chooseEvent);
  const closeOutcome = useGameStore((s) => s.closeEventOutcome);

  if (!game) return null;
  const event = outcome ? EVENT_MAP[outcome.eventId] : game.phase === 'event' ? currentEvent(game) : null;
  // Waits for the tutorial on day one instead of opening underneath it.
  const open = !!event && !transition && !howTo;
  const cat = event ? CATEGORY[event.category] : CATEGORY.dilemma;
  const CatIcon = cat.icon;
  const from = event ? STAKEHOLDERS[event.from] : null;
  const shaky = event && (event.category === 'incident' || event.category === 'crisis') && !outcome;

  return (
    <Modal
      open={open}
      size="lg"
      label={event?.title ?? 'Event'}
      z={55}
      resetKey={event ? `${event.id}:${outcome ? 'outcome' : 'question'}` : undefined}
    >
      {event && from && (
        <motion.div
          key={event.id}
          initial={shaky ? { x: 0 } : false}
          animate={shaky ? { x: [0, -10, 10, -7, 7, -3, 3, 0] } : undefined}
          transition={{ duration: 0.55, delay: 0.25 }}
          style={{ perspective: 1200 }}
          // Clipped so the card's 3D flip never pokes past the dialog and flashes scrollbars.
          className="overflow-clip"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-30 blur-3xl" style={{ background: `radial-gradient(closest-side, ${cat.glow}, transparent)` }} aria-hidden />
          <AnimatePresence mode="wait" initial={false}>
            {!outcome ? (
              <motion.div
                key="front"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="relative p-5 sm:p-7"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider', cat.cls)}>
                    <CatIcon size={13} aria-hidden /> {cat.label}
                  </span>
                  <span className="text-xs text-ink-400">{quarterLabel(game.quarter)}</span>
                </div>
                <YourNumbers game={game} />
                <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{event.title}</h2>
                <div className="mt-4 flex gap-3">
                  <Avatar id={event.from} size="lg" />
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/4 p-4">
                    <div className="text-xs font-semibold text-ink-300">
                      {from.name}, {from.title}
                    </div>
                    <p className="mt-1 text-base leading-relaxed text-ink-100">{event.body(game)}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="label-caps flex items-center gap-1.5">
                    <Lightbulb size={12} aria-hidden /> How do you respond?
                  </div>
                  {event.choices.map((choice, i) => {
                    const available = isChoiceAvailable(game, event.id, choice.id);
                    return (
                      <motion.button
                        key={choice.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        whileHover={available ? { x: 4 } : undefined}
                        whileTap={available ? { scale: 0.99 } : undefined}
                        disabled={!available}
                        onClick={() => chooseEvent(choice.id)}
                        className={cn(
                          'group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors',
                          available ? 'border-white/10 bg-ink-800/80 hover:border-brand-violet/60 hover:bg-ink-700/80' : 'cursor-not-allowed border-dashed border-white/10 bg-transparent',
                        )}
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block font-semibold', available ? 'text-white' : 'text-ink-300')}>{choice.label}</span>
                          <span className={cn('mt-0.5 block text-sm', available ? 'text-ink-300' : 'text-amber-200')}>
                            {available ? choiceDescription(choice, game) : choice.unavailableReason}
                          </span>
                        </span>
                        {available && <ArrowRight size={18} className="mt-1 shrink-0 text-ink-400 transition group-hover:text-white" aria-hidden />}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="relative p-5 sm:p-7"
              >
                <div className="text-xs text-ink-400">
                  {event.title} · You chose: <span className="text-ink-200">{event.choices.find((c) => c.id === outcome.choiceId)?.label}</span>
                </div>
                <DebriefCard debrief={outcome.debrief} className="mt-3" />
                <div className="mt-4">
                  <div className="label-caps mb-2">Impact</div>
                  <ChangeChips changes={outcome.changes} />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={closeOutcome} icon={<ArrowRight size={16} />}>
                    {game.phase === 'event' ? 'Next event' : 'Back to work'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </Modal>
  );
}

/**
 * The numbers a choice can cost, shown while the player decides, since the dialog covers the
 * scoreboard and can't be closed. Values in warning territory are highlighted.
 */
function YourNumbers({ game }: { game: GameState }) {
  const risk = Math.round(sel.totalRisk(game));
  const items = [
    // Budget is flagged when it can't cover the run costs due at quarter end; morale when staff are fearful.
    { label: 'Budget', value: fmtMoney(game.budget), warn: game.budget < sel.quarterlyCosts(game).total },
    { label: 'Trust', value: String(Math.round(game.trust)), warn: game.trust < BALANCE.warningThreshold },
    { label: 'Risk', value: String(risk), warn: risk >= BALANCE.trust.riskThreshold },
    { label: 'Morale', value: String(Math.round(game.morale)), warn: game.morale < 40 },
  ];
  return (
    <dl aria-label="Your numbers" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-white/4 px-3 py-2 text-xs">
      {items.map((it) => (
        <div key={it.label} className="flex gap-1.5">
          <dt className="text-ink-400">{it.label}</dt>
          <dd className={cn('font-semibold', it.warn ? 'text-rose-300' : 'text-white')}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
