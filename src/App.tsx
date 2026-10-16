import { MotionConfig, motion } from 'framer-motion';
import { useEffect } from 'react';
import { HowToPlay } from '@/components/feedback/HowToPlay';
import { QuarterTransition } from '@/components/feedback/QuarterTransition';
import { EndScreen } from '@/components/screens/EndScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { SetupScreen } from '@/components/screens/SetupScreen';
import { TitleScreen } from '@/components/screens/TitleScreen';
import { setMuted } from '@/lib/sfx';
import { useGameStore } from '@/store/gameStore';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const hasGame = useGameStore((s) => s.game !== null);
  const muted = useGameStore((s) => s.muted);

  useEffect(() => setMuted(muted), [muted]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  const current = (screen === 'game' || screen === 'end') && !hasGame ? 'title' : screen;

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
    </MotionConfig>
  );
}
