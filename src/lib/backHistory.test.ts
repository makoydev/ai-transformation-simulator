import { describe, expect, it } from 'vitest';
import { createBackHistory, type HistoryLike } from './backHistory';

/** Behaves like window.history: pushState drops forward entries, and go() lands later, with a popstate. */
class FakeHistory implements HistoryLike {
  entries: unknown[] = [null];
  index = 0;
  pending: number[] = [];
  /** Set when a history.go() reaches back past the game's first entry, to whatever page came before. */
  leftSite = false;
  onPop: (state: unknown) => void = () => {};

  get state(): unknown {
    return this.entries[this.index];
  }
  pushState(data: unknown): void {
    this.entries = [...this.entries.slice(0, this.index + 1), data];
    this.index++;
  }
  replaceState(data: unknown): void {
    this.entries[this.index] = data;
  }
  go(delta: number): void {
    this.pending.push(delta);
  }
  /** The browser finishes the history.go() calls it was asked for. */
  land(): void {
    for (const delta of this.pending.splice(0)) this.traverse(delta);
  }
  /** The player presses Back (or Forward with +1). Returns false when Back would leave the site. */
  press(delta = -1): boolean {
    if (this.index + delta < 0) return false;
    this.traverse(delta);
    return true;
  }
  private traverse(delta: number): void {
    if (this.index + delta < 0) {
      this.leftSite = true;
      return;
    }
    this.index = Math.min(this.entries.length - 1, this.index + delta);
    this.onPop(this.state);
  }
}

/** A stand-in for the app: a number of open layers (screen and dialogs), and a Back handler that closes one. */
function setup() {
  const history = new FakeHistory();
  const app = { layers: 0, backs: 0 };
  const back = createBackHistory(
    history,
    () => app.layers,
    () => {
      app.backs++;
      app.layers = Math.max(0, app.layers - 1);
    },
  );
  history.onPop = (state) => {
    back.popped(state);
    back.sync();
  };
  /** The app changed (a dialog opened or closed); in the game this runs after React renders. */
  const change = (layers: number) => {
    app.layers = layers;
    back.sync();
  };
  return { history, app, change };
}

describe('createBackHistory', () => {
  it('adds one entry per layer, and Back closes them one at a time before leaving', () => {
    const { history, app, change } = setup();
    change(1); // left the title screen
    change(2); // opened a department
    change(3); // and a confirmation on top
    expect(history.index).toBe(3);

    expect(history.press()).toBe(true);
    expect(app.layers).toBe(2);
    expect(history.press()).toBe(true);
    expect(app.layers).toBe(1);
    expect(history.press()).toBe(true);
    expect(app.layers).toBe(0);
    expect(history.press()).toBe(false); // the next Back leaves the site
  });

  it('removes the entry when a dialog is closed in the page, so the next Back is not wasted', () => {
    const { history, app, change } = setup();
    change(1);
    change(2);
    change(1); // closed with ✕ or Escape
    history.land();
    expect(history.index).toBe(1);
    expect(app.backs).toBe(0); // our own history.go() is not a press of Back

    history.press();
    expect(app.layers).toBe(0);
    expect(history.index).toBe(0);
  });

  it('goes back several entries when several layers close at once', () => {
    const { history, app, change } = setup();
    change(1);
    change(3);
    change(0); // e.g. "Title screen" from the menu while dialogs were open
    history.land();
    expect(history.index).toBe(0);
    expect(app.backs).toBe(0);
  });

  it('never goes back past its first entry when layers close faster than the browser moves', () => {
    const { history, change } = setup();
    change(1);
    change(2);
    change(1); // a dialog closes...
    change(0); // ...and the player leaves for the title screen before the browser has moved
    history.land();
    history.land();
    expect(history.leftSite).toBe(false);
    expect(history.index).toBe(0);
    expect(history.pending).toEqual([]);
  });

  it('catches up when a dialog opens before the browser has moved', () => {
    const { history, change } = setup();
    change(1);
    change(2);
    change(1); // a dialog closes...
    change(2); // ...and another opens before the browser has moved
    expect(history.index).toBe(2);
    history.land();
    expect(history.index).toBe(2);
    expect(history.state).toEqual({ backDepth: 2 });
    expect(history.entries).toHaveLength(3);
  });

  it('undoes Forward instead of treating it as Back', () => {
    const { history, app, change } = setup();
    change(1);
    change(2);
    history.press(); // closes the dialog
    history.press(1); // Forward can't reopen it
    expect(app.backs).toBe(1);
    expect(app.layers).toBe(1);
    history.land();
    expect(history.index).toBe(1);
  });

  it('keeps an entry for the layers still open when Back jumps several entries', () => {
    const { history, app, change } = setup();
    change(1);
    change(3);
    history.press(-2); // long-press Back to an earlier entry
    expect(app.layers).toBe(2);
    expect(history.index).toBe(2);
  });

  it('starts counting from the current entry after a reload', () => {
    const history = new FakeHistory();
    history.entries = [null, { backDepth: 1 }, { backDepth: 2 }];
    history.index = 2;
    const back = createBackHistory(history, () => 0, () => {});
    back.sync();
    expect(history.state).toEqual({ backDepth: 0 });
    expect(history.pending).toEqual([]);
  });
});
