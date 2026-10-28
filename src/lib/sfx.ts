/**
 * Tiny procedural sound effects via the Web Audio API: no audio assets,
 * no network requests. Silently no-ops where audio isn't available.
 */
export type Sound = 'click' | 'select' | 'success' | 'fail' | 'coin' | 'alert' | 'whoosh' | 'deploy' | 'error' | 'stamp';

let ctx: AudioContext | null = null;
let muted = false;
let volume = 1;

export function setMuted(value: boolean): void {
  muted = value;
}

/** Master volume from 0 to 1, applied to every sound. */
export function setVolume(value: number): void {
  volume = Math.min(1, Math.max(0, value));
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface Tone {
  freq: number;
  to?: number;
  start?: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function tones(list: Tone[]): void {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  for (const t of list) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const start = now + (t.start ?? 0);
    osc.type = t.type ?? 'sine';
    osc.frequency.setValueAtTime(t.freq, start);
    if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, start + t.duration);
    gain.gain.setValueAtTime(0.0001, start);
    // Exponential ramps can't reach zero, so the quietest peak stays just above the floor.
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, (t.gain ?? 0.08) * volume), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + t.duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + t.duration + 0.02);
  }
}

const SOUNDS: Record<Sound, Tone[]> = {
  click: [{ freq: 660, duration: 0.05, type: 'triangle', gain: 0.04 }],
  select: [{ freq: 520, to: 780, duration: 0.08, type: 'triangle', gain: 0.05 }],
  success: [
    { freq: 523, duration: 0.12, type: 'triangle' },
    { freq: 659, start: 0.08, duration: 0.12, type: 'triangle' },
    { freq: 784, start: 0.16, duration: 0.22, type: 'triangle' },
  ],
  fail: [
    { freq: 330, to: 220, duration: 0.25, type: 'sawtooth', gain: 0.04 },
    { freq: 220, to: 150, start: 0.18, duration: 0.3, type: 'sawtooth', gain: 0.035 },
  ],
  coin: [
    { freq: 988, duration: 0.06, type: 'square', gain: 0.03 },
    { freq: 1319, start: 0.06, duration: 0.18, type: 'square', gain: 0.03 },
  ],
  alert: [
    { freq: 880, duration: 0.1, type: 'square', gain: 0.035 },
    { freq: 660, start: 0.14, duration: 0.1, type: 'square', gain: 0.035 },
    { freq: 880, start: 0.28, duration: 0.14, type: 'square', gain: 0.035 },
  ],
  whoosh: [{ freq: 200, to: 900, duration: 0.35, type: 'sine', gain: 0.05 }],
  deploy: [
    { freq: 392, duration: 0.1, type: 'triangle' },
    { freq: 523, start: 0.08, duration: 0.1, type: 'triangle' },
    { freq: 659, start: 0.16, duration: 0.1, type: 'triangle' },
    { freq: 1047, start: 0.24, duration: 0.35, type: 'triangle', gain: 0.07 },
  ],
  error: [{ freq: 180, duration: 0.15, type: 'square', gain: 0.03 }],
  stamp: [
    { freq: 120, to: 60, duration: 0.18, type: 'sine', gain: 0.12 },
    { freq: 2400, to: 800, duration: 0.05, type: 'triangle', gain: 0.02 },
  ],
};

export function play(sound: Sound): void {
  if (muted) return;
  tones(SOUNDS[sound]);
}
