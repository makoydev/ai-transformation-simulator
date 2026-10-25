import { animate, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  format: (v: number) => string;
  duration?: number;
  className?: string;
}

/** Counts smoothly from the previous value to the new one. With reduced motion it shows the new value at once. */
export function AnimatedNumber({ value, format, duration = 0.9, className }: Props) {
  const reduceMotion = useReducedMotion();
  const mv = useMotionValue(value);
  const formatRef = useRef(format);
  formatRef.current = format;
  const [display, setDisplay] = useState(() => format(value));

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(formatRef.current(v)),
    });
    return () => controls.stop();
  }, [mv, value, duration, reduceMotion]);

  return <span className={className}>{reduceMotion ? format(value) : display}</span>;
}
