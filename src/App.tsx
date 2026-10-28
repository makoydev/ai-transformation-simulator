import { MotionConfig, motion } from 'framer-motion';
import { useEffect } from 'react';
import { HowToPlay } from '@/components/feedback/HowToPlay';
import { LiveRegion } from '@/components/feedback/LiveRegion';
import { QuarterTransition } from '@/components/feedback/QuarterTransition';
import { EndScreen } from '@/components/screens/EndScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { SetupScreen } from '@/components/screens/SetupScreen';
import { TitleScreen } from '@/components/screens/TitleScreen';
import { createBackHistory } from '@/lib/backHistory';
import { closableDialogCount, closeTopDialog, subscribeDialogs } from '@/lib/dialogStack';
import { quarterLabel } from '@/lib/format';
import { setMuted, setVolume } from '@/lib/sfx';
import { selectScreen, useGameStore, type Screen } from '@/store/gameStore';

/**
 * The browser Back button (and the Android back gesture) closes the top dialog, or goes back to
 * the title screen, before it leaves the site. Dialogs that need an answer (an event, the board
 * review) can't be closed, so Back leaves the game for the title screen; the game is saved.
 */
function useBackButton(): void {
  useEffect(() => {
    const depth = () => (selectScreen(useGameStore.getState()) === 'title' ? 0 : 1) + closableDialogCount();
    const back = createBackHistory(window.history, depth, () => {
      if (closeTopDialog()) return;
      const state = useGameStore.getState();
      if (selectScreen(state) !== 'title') state.goTo('title');
    });
    // Dialogs join and leave the stack in effects after React renders, so count them after that.
    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(back.sync, 0);
    };
    const onPopState = (e: PopStateEvent) => {
      back.popped(e.state);
      schedule();
    };
    window.addEventListener('popstate', onPopState);
    const unsubscribeStore = useGameStore.subscribe(schedule);
    const unsubscribeDialogs = subscribeDialogs(schedule);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('popstate', onPopState);
      unsubscribeStore();
      unsubscribeDialogs();
    };
  }, []);
}

const APP_TITLE = 'AI Transformation Simulator';

/** The browser tab says where the player is, e.g. "Q3 · Year 1 · AI Transformation Simulator". */
function useDocumentTitle(screen: Screen) {
  const quarter = useGameStore((s) => s.game?.quarter);
  useEffect(() => {
    const where = screen === 'game' && quarter ? quarterLabel(quarter) : screen === 'end' ? 'Scorecard' : screen === 'setup' ? 'New game' : null;
    document.title = where ? `${where} · ${APP_TITLE}` : APP_TITLE;
  }, [screen, quarter]);
}

export default function App() {
  const current = useGameStore(selectScreen);
  const muted = useGameStore((s) => s.muted);

  const volume = useGameStore((s) => s.volume);

  useEffect(() => setMuted(muted), [muted]);
  useEffect(() => setVolume(volume), [volume]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [current]);
  useBackButton();
  useDocumentTitle(current);

  return (
    <MotionConfig reducedMotion="user">
      {/* Mount-only fade: screens never wait on an exit animation, so a screen swap can't get stuck mid-transition. */}
      <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {current === 'title' && <TitleScreen />}
        {current === 'setup' && <SetupScreen />}
        {current === 'game' && <GameScreen />}
        {current === 'end' && <EndScreen />}
      </motion.div>
      {current !== 'game' && <HowToPlay />}
      <QuarterTransition />
      <LiveRegion />
    </MotionConfig>
  );
}
