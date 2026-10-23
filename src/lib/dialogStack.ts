/**
 * The open dialogs, bottom to top. Only the top one is interactive: the app
 * root and every dialog below it are made inert (no focus, clicks, or screen
 * reader access), and the page behind them stops scrolling.
 */
interface Entry {
  el: HTMLElement;
  /** How the player closes it; missing for dialogs that need an answer (an event, the board review). */
  close?: () => void;
}

const stack: Entry[] = [];
const listeners = new Set<() => void>();

function sync(): void {
  const root = document.getElementById('root');
  if (root) root.inert = stack.length > 0;
  stack.forEach(({ el }, i) => {
    el.inert = i < stack.length - 1;
  });
  document.body.style.overflow = stack.length > 0 ? 'hidden' : '';
  listeners.forEach((listener) => listener());
}

/** For useSyncExternalStore: calls `listener` whenever a dialog opens or closes. */
export function subscribeDialogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const dialogCount = (): number => stack.length;

/** Open dialogs the player can close, each one a step for the browser Back button. */
export const closableDialogCount = (): number => stack.filter((entry) => entry.close).length;

export function pushDialog(el: HTMLElement, close?: () => void): void {
  stack.push({ el, close });
  sync();
}

/** Removes a dialog that is closing. It stays inert while its exit animation plays. */
export function removeDialog(el: HTMLElement): void {
  const i = stack.findIndex((entry) => entry.el === el);
  if (i === -1) return;
  stack.splice(i, 1);
  el.inert = true;
  sync();
}

export function isTopDialog(el: HTMLElement): boolean {
  return stack[stack.length - 1]?.el === el;
}

export function topDialog(): HTMLElement | undefined {
  return stack[stack.length - 1]?.el;
}

/** Closes the top dialog. False when no dialog is open, or the top one needs an answer. */
export function closeTopDialog(): boolean {
  const close = stack[stack.length - 1]?.close;
  close?.();
  return !!close;
}
