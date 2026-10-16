import confetti from 'canvas-confetti';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const BRAND = ['#8f8acb', '#7f8dc6', '#72b4bb', '#d6ab5e', '#6db894'];

/** Big celebration: a system goes live in production. */
export function celebrateDeploy(): void {
  if (reducedMotion()) return;
  const defaults = { colors: BRAND, disableForReducedMotion: true, zIndex: 9999 };
  confetti({ ...defaults, particleCount: 90, spread: 70, startVelocity: 45, origin: { x: 0.5, y: 0.65 } });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
    confetti({ ...defaults, particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
  }, 180);
}

/** Small burst: a great decision. */
export function celebrateSmall(): void {
  if (reducedMotion()) return;
  confetti({
    particleCount: 40,
    spread: 50,
    startVelocity: 30,
    scalar: 0.8,
    origin: { x: 0.5, y: 0.45 },
    colors: BRAND,
    disableForReducedMotion: true,
    zIndex: 9999,
  });
}
