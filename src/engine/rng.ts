/**
 * Deterministic, serializable PRNG (mulberry32). The generator state lives in
 * GameState.rng so a saved game resumes with exactly the same future rolls,
 * and tests can replay a game from a seed.
 */
export interface RngHolder {
  rng: number;
}

export function nextRng(state: number): { value: number; state: number } {
  const next = (state + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, state: next };
}

/** Returns a float in [0, 1) and advances the holder's state. */
export function random(holder: RngHolder): number {
  const { value, state } = nextRng(holder.rng);
  holder.rng = state;
  return value;
}

export function pick<T>(holder: RngHolder, items: readonly T[]): T {
  return items[Math.floor(random(holder) * items.length)];
}

export function weightedPick<T>(holder: RngHolder, items: readonly { item: T; weight: number }[]): T | null {
  const valid = items.filter((i) => i.weight > 0);
  const total = valid.reduce((sum, i) => sum + i.weight, 0);
  if (total <= 0) return null;
  let roll = random(holder) * total;
  for (const entry of valid) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return valid[valid.length - 1].item;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
