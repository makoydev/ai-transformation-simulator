import { animate, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  format: (v: number) => string;
  duration?: number;
  className?: string;
}

/** Counts smoothly from the previous value to the new one. */
export function AnimatedNumber({ value, format, duration = 0.9, className }: Props) {
  const mv = useMotionValue(value);
  const formatRef = useRef(format);
  formatRef.current = format;
  const [display, setDisplay] = useState(() => format(value));

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(formatRef.current(v)),
    });
    return () => controls.stop();
  }, [mv, value, duration]);

  return <span className={className}>{display}</span>;
}
