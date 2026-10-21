/**
 * The React-facing store. Game rules live in the pure engine; this layer
 * wires engine calls to UI state (modals, toasts, transitions) and
 * "juice" (sound, confetti, screen shake). The game itself is persisted
 * to localStorage so players can continue later.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  applyAction,
  beginNextQuarter,
  createInitialState,
  diffStates,
  endQuarter as engineEndQuarter,
  resolveEvent,
  SAVE_VERSION,
  validateAction,
  type Change,
  type Debrief,
  type DeptId,
  type GameAction,
  type GameState,
  type ScenarioId,
  type StakeholderId,
  type Tone,
  type Verdict,
} from '@/engine';
import { celebrateDeploy, celebrateSmall } from '@/lib/fx';
import { play } from '@/lib/sfx';

export type Screen = 'title' | 'setup' | 'game' | 'end';
export type Tab = 'org' | 'portfolio' | 'strategy' | 'playbook' | 'people';

export interface Toast {
  id: number;
  kind: 'quip' | 'debrief' | 'error';
  text: string;
  title?: string;
  stakeholder?: StakeholderId;
  tone?: Tone;
  verdict?: Verdict;
}

export interface EventOutcome {
  eventId: string;
  choiceId: string;
  debrief: Debrief;
  changes: Change[];
}

interface StoreState {
  game: GameState | null;
  screen: Screen;
  tab: Tab;
  deptModal: DeptId | null;
  projectModal: string | null;
  howTo: boolean;
  seenHowTo: boolean;
  /** Games played to the end (finished or fired). Zero means the player is new. */
  finishedGames: number;
  /** The player hid the first-quarter tips. */
  coachOff: boolean;
  muted: boolean;
  toasts: Toast[];
  eventOutcome: EventOutcome | null;
  transition: { key: number; quarter: number } | null;
  shake: number;
  revealed: string[];
  menuOpen: boolean;

  newGame: (scenarioId: ScenarioId, playerName: string) => void;
  continueGame: () => void;
  goTo: (screen: Screen) => void;
  perform: (action: GameAction) => boolean;
  endQuarter: () => void;
  advanceFromReport: () => void;
  chooseEvent: (choiceId: string) => void;
  closeEventOutcome: () => void;
  setTab: (tab: Tab) => void;
  openDept: (dept: DeptId | null) => void;
  openProject: (projectId: string | null) => void;
  setHowTo: (open: boolean) => void;
  setMenu: (open: boolean) => void;
  hideCoach: () => void;
  toggleMute: () => void;
  dismissToast: (id: number) => void;
  markRevealed: (projectId: string) => void;
  clearTransition: () => void;
  abandonGame: () => void;
}

let toastSeq = 0;

function toastsFor(before: GameState, after: GameState): Toast[] {
  const known = new Set(before.inbox.map((m) => m.id));
  const quips: Toast[] = after.inbox
    .filter((m) => !known.has(m.id))
    .slice(-2)
    .map((m) => ({ id: ++toastSeq, kind: 'quip', text: m.text, stakeholder: m.stakeholder, tone: m.tone }));
  const debriefs: Toast[] = after.debriefs
    .slice(before.debriefs.length)
    .filter((d) => d.kind === 'decision')
    .map((d) => ({ id: ++toastSeq, kind: 'debrief', title: d.title, text: d.insight, verdict: d.verdict }));
  return [...debriefs, ...quips];
}

const MAX_TOASTS = 4;

export const useGameStore = create<StoreState>()(
  persist(
    (set, get) => ({
      game: null,
      screen: 'title',
      tab: 'org',
      deptModal: null,
      projectModal: null,
      howTo: false,
      seenHowTo: false,
      finishedGames: 0,
      coachOff: false,
      muted: false,
      toasts: [],
      eventOutcome: null,
      transition: null,
      shake: 0,
      revealed: [],
      menuOpen: false,

      newGame: (scenarioId, playerName) => {
        play('whoosh');
        set({
          game: createInitialState(scenarioId, playerName),
          screen: 'game',
          tab: 'org',
          deptModal: null,
          projectModal: null,
          toasts: [],
          eventOutcome: null,
          revealed: [],
          menuOpen: false,
          transition: { key: Date.now(), quarter: 1 },
          howTo: !get().seenHowTo,
        });
      },

      continueGame: () => {
        const { game } = get();
        if (!game) return;
        play('whoosh');
        set({ screen: game.phase === 'ended' ? 'end' : 'game', transition: null, menuOpen: false });
      },

      goTo: (screen) => set({ screen, menuOpen: false }),

      perform: (action) => {
        const { game } = get();
        if (!game) return false;
        const reason = validateAction(game, action);
        if (reason) {
          play('error');
          set((st) => ({
            toasts: [...st.toasts, { id: ++toastSeq, kind: 'error' as const, text: reason }].slice(-MAX_TOASTS),
          }));
          return false;
        }
        const next = applyAction(game, action);
        if (action.type === 'scale') {
          play('deploy');
          celebrateDeploy();
        } else if (action.type === 'kill' || action.type === 'retire') {
          play('stamp');
        } else if (action.type === 'launchPilot' || action.type === 'policy' || action.type === 'initiative') {
          play('coin');
        } else {
          play('select');
        }
        set((st) => ({ game: next, toasts: [...st.toasts, ...toastsFor(game, next)].slice(-MAX_TOASTS) }));
        return true;
      },

      endQuarter: () => {
        const { game } = get();
        if (!game || game.phase !== 'planning') return;
        const next = engineEndQuarter(game);
        play('whoosh');
        set((st) => ({
          game: next,
          deptModal: null,
          projectModal: null,
          toasts: [...st.toasts, ...toastsFor(game, next).filter((t) => t.kind !== 'quip')].slice(-MAX_TOASTS),
        }));
      },

      advanceFromReport: () => {
        const { game } = get();
        if (!game || game.phase !== 'report') return;
        const next = beginNextQuarter(game);
        if (next.phase === 'ended') {
          play(next.outcome === 'fired' ? 'fail' : 'success');
          set((st) => ({ game: next, screen: 'end', toasts: [], finishedGames: st.finishedGames + 1 }));
          return;
        }
        play('whoosh');
        set({ game: next, transition: { key: Date.now(), quarter: next.quarter } });
      },

      chooseEvent: (choiceId) => {
        const { game } = get();
        if (!game || game.phase !== 'event') return;
        const eventId = game.pendingEvents[0];
        const { state, debrief } = resolveEvent(game, choiceId);
        if (!debrief) return;
        const changes = diffStates(game, state);
        if (debrief.verdict === 'great') {
          play('success');
          celebrateSmall();
        } else if (debrief.verdict === 'bad') {
          play('fail');
          set((st) => ({ shake: st.shake + 1 }));
        } else {
          play('select');
        }
        set({ game: state, eventOutcome: { eventId, choiceId, debrief, changes } });
      },

      closeEventOutcome: () => {
        play('click');
        set({ eventOutcome: null });
      },

      setTab: (tab) => {
        play('click');
        set({ tab });
      },
      openDept: (dept) => set({ deptModal: dept }),
      openProject: (projectId) => set({ projectModal: projectId }),
      setHowTo: (open) => set(open ? { howTo: true } : { howTo: false, seenHowTo: true }),
      setMenu: (open) => set({ menuOpen: open }),
      hideCoach: () => set({ coachOff: true }),
      toggleMute: () => set((st) => ({ muted: !st.muted })),
      dismissToast: (id) => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),
      markRevealed: (projectId) =>
        set((st) => (st.revealed.includes(projectId) ? st : { revealed: [...st.revealed, projectId] })),
      clearTransition: () => set({ transition: null }),
      abandonGame: () =>
        set({ game: null, screen: 'title', toasts: [], eventOutcome: null, menuOpen: false, deptModal: null, projectModal: null }),
    }),
    {
      name: 'ai-transformation-simulator',
      version: SAVE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (st) => ({
        game: st.game,
        seenHowTo: st.seenHowTo,
        finishedGames: st.finishedGames,
        coachOff: st.coachOff,
        muted: st.muted,
        revealed: st.revealed,
      }),
      migrate: (persisted, version) => {
        // Saves from an incompatible engine version are discarded rather than crashing the game.
        if (version !== SAVE_VERSION) return { game: null, seenHowTo: false, finishedGames: 0, coachOff: false, muted: false, revealed: [] };
        return persisted as Partial<StoreState>;
      },
    },
  ),
);

/**
 * True while one of the game's dialogs is open. Known in the same render that opens the
 * dialog, unlike the DOM dialog stack, which updates in an effect afterwards.
 */
export const selectDialogOpen = (s: StoreState): boolean =>
  s.deptModal !== null ||
  s.projectModal !== null ||
  s.howTo ||
  s.eventOutcome !== null ||
  s.game?.phase === 'event' ||
  s.game?.phase === 'report';

/** Convenience hook for components that render only during a game. */
export function useGame(): GameState {
  const game = useGameStore((s) => s.game);
  if (!game) throw new Error('useGame() called without an active game');
  return game;
}
