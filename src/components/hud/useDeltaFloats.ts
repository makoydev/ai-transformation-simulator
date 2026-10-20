import { useEffect, useRef, useState } from 'react';

export interface DeltaFloat {
  id: number;
  delta: number;
}

let floatSeq = 0;

/**
 * Watches a value and returns the recent signed changes to float above it, plus a brief
 * good/bad flash. Shared by the full tiles and the compact phone scoreboard.
 */
export function useDeltaFloats(value: number, epsilon: number, higherIsBetter: boolean) {
  const prev = useRef(value);
  const [floats, setFloats] = useState<DeltaFloat[]>([]);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);

  useEffect(() => {
    const delta = value - prev.current;
    prev.current = value;
    if (Math.abs(delta) < epsilon) return;
    const good = higherIsBetter ? delta > 0 : delta < 0;
    const id = ++floatSeq;
    setFloats((f) => [...f, { id, delta }]);
    setFlash(good ? 'good' : 'bad');
    const t1 = setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1600);
    const t2 = setTimeout(() => setFlash(null), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [value, epsilon, higherIsBetter]);

  return { floats, flash };
}

/** Ring colours for the brief flash after a change. */
export const FLASH_RING = {
  good: 'shadow-[0_0_0_1px_rgba(109,184,148,0.45),0_0_24px_-4px_rgba(109,184,148,0.25)]',
  bad: 'shadow-[0_0_0_1px_rgba(214,138,146,0.45),0_0_24px_-4px_rgba(214,138,146,0.25)]',
};
