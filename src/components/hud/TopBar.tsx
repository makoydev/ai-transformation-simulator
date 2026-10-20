import { motion } from 'framer-motion';
import { HelpCircle, LogOut, Menu, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SCENARIOS } from '@/data/scenarios';
import { cn } from '@/lib/cn';
import { quarterLabel } from '@/lib/format';
import { BrandIcon } from '@/lib/icons';
import { useGame, useGameStore } from '@/store/gameStore';

export function TopBar() {
  const game = useGame();
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const setHowTo = useGameStore((s) => s.setHowTo);
  const menuOpen = useGameStore((s) => s.menuOpen);
  const setMenu = useGameStore((s) => s.setMenu);
  const goTo = useGameStore((s) => s.goTo);
  const abandon = useGameStore((s) => s.abandonGame);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const sc = SCENARIOS[game.scenarioId];
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // An open menu takes focus, and closes on Escape, an outside click or tapping away.
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenu(false);
      menuButtonRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !menuButtonRef.current?.contains(t)) setMenu(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen, setMenu]);

  // Arrow keys, Home and End move between menu items; Tab leaves and closes the menu.
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'ArrowDown' ? (i + 1) % items.length
      : e.key === 'ArrowUp' ? (i - 1 + items.length) % items.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? items.length - 1
      : null;
    if (next !== null) {
      e.preventDefault();
      items[next]?.focus();
    } else if (e.key === 'Tab') {
      setMenu(false);
    }
  };

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
          <BrandIcon size={22} className="text-white" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-base font-bold text-white sm:text-lg">{sc.company}</div>
          <div className="truncate text-xs text-ink-300">
            {game.playerName ? `${game.playerName}, ` : ''}Head of AI Transformation · {sc.difficulty}
          </div>
        </div>
      </div>

      <div className="order-3 flex w-full items-center gap-3 sm:order-0 sm:ml-auto sm:w-auto">
        <div className="text-right">
          <div className="label-caps">Quarter</div>
          <div className="font-display text-sm font-semibold text-white">{quarterLabel(game.quarter)}</div>
        </div>
        <ol className="flex flex-1 items-center gap-1 sm:flex-none" aria-label={`Quarter ${game.quarter} of ${game.maxQuarters}`}>
          {Array.from({ length: game.maxQuarters }, (_, i) => {
            const q = i + 1;
            const state = q < game.quarter ? 'past' : q === game.quarter ? 'current' : 'future';
            return (
              <li key={q} className="relative flex-1 sm:w-7 sm:flex-none">
                <div
                  className={cn(
                    'h-2 rounded-full transition-colors',
                    state === 'past' && 'bg-brand-violet/70',
                    state === 'current' && 'bg-brand-cyan',
                    state === 'future' && 'bg-white/10',
                    q === 4 && 'mr-1.5',
                  )}
                />
                {state === 'current' && (
                  <motion.div
                    layoutId="quarter-glow"
                    className="absolute inset-0 rounded-full bg-brand-cyan/30 blur-xs"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => setHowTo(true)} aria-label="How to play" icon={<HelpCircle size={16} />}>
          <span className="hidden md:inline">How to play</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          icon={muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        />
        <Button
          ref={menuButtonRef}
          variant="ghost"
          size="sm"
          onClick={() => setMenu(!menuOpen)}
          aria-label="Menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="game-menu"
          icon={<Menu size={16} />}
        />
        {menuOpen && (
          <motion.div
            ref={menuRef}
            id="game-menu"
            role="menu"
            aria-label="Game menu"
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong absolute right-0 top-10 z-40 w-56 p-1.5"
          >
            <button
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-100 hover:bg-white/10 focus-visible:bg-white/10"
              onClick={() => goTo('title')}
            >
              <LogOut size={15} /> Save & exit to title
            </button>
            <button
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-200 hover:bg-rose-500/15 focus-visible:bg-rose-500/15"
              onClick={() => {
                // Close the menu and refocus its button first, so the confirm dialog returns focus there.
                setMenu(false);
                menuButtonRef.current?.focus();
                setConfirmAbandon(true);
              }}
            >
              <RotateCcw size={15} /> Abandon & start over
            </button>
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={confirmAbandon}
        title="Abandon this game?"
        message={`Your saved game at ${sc.company} (${quarterLabel(game.quarter)}) will be deleted. This can't be undone.`}
        confirmLabel="Abandon game"
        onCancel={() => setConfirmAbandon(false)}
        onConfirm={() => {
          setConfirmAbandon(false);
          abandon();
          goTo('setup');
        }}
      />
    </header>
  );
}
