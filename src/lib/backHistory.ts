/**
 * Makes the browser Back button (and the Android back gesture) step back through the game
 * instead of leaving the site. The history holds one entry for each step back the player can
 * take, and each entry records its depth in `history.state`. A popstate to a shallower entry
 * is a press of Back: `onBack` closes one layer, and `sync` then matches the history to the
 * app again.
 */

/** The parts of `window.history` this uses, so tests can pass a fake. */
export interface HistoryLike {
  readonly state: unknown;
  pushState(data: unknown, unused: string): void;
  replaceState(data: unknown, unused: string): void;
  go(delta: number): void;
}

export interface BackHistory {
  /** Adds or removes entries so there is one per step back. Call after the screen or a dialog changes. */
  sync: () => void;
  /** Call from the popstate listener with `event.state`, then call `sync` once the app has updated. */
  popped: (state: unknown) => void;
}

const KEY = 'backDepth';

function depthOf(state: unknown): number {
  const depth = state && typeof state === 'object' ? (state as Record<string, unknown>)[KEY] : undefined;
  return typeof depth === 'number' ? depth : 0;
}

/**
 * `depth` is how many steps back the player can take right now (0 on the title screen with
 * nothing open). `onBack` takes one of them, for example by closing the top dialog.
 */
export function createBackHistory(history: HistoryLike, depth: () => number, onBack: () => void): BackHistory {
  // After a reload the entries behind this one belong to the old page, so counting starts here.
  history.replaceState({ [KEY]: 0 }, '');
  let at = 0;
  // True while one of our own history.go() calls is in flight: its popstate is not a press of Back.
  let moving = false;

  return {
    sync() {
      if (moving) return;
      const want = depth();
      while (at < want) history.pushState({ [KEY]: ++at }, '');
      if (at > want) {
        moving = true;
        history.go(want - at);
      }
    },
    popped(state) {
      const now = depthOf(state);
      const back = !moving && now < at;
      moving = false;
      at = now;
      // Holding Back can jump several entries. One layer still closes, and sync adds back entries for the rest.
      if (back) onBack();
    },
  };
}
