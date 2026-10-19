/**
 * The open dialogs, bottom to top. Only the top one is interactive: the app
 * root and every dialog below it are made inert (no focus, clicks, or screen
 * reader access), and the page behind them stops scrolling.
 */
const stack: HTMLElement[] = [];

function sync(): void {
  const root = document.getElementById('root');
  if (root) root.inert = stack.length > 0;
  stack.forEach((el, i) => {
    el.inert = i < stack.length - 1;
  });
  document.body.style.overflow = stack.length > 0 ? 'hidden' : '';
}

export function pushDialog(el: HTMLElement): void {
  stack.push(el);
  sync();
}

/** Removes a dialog that is closing. It stays inert while its exit animation plays. */
export function removeDialog(el: HTMLElement): void {
  const i = stack.indexOf(el);
  if (i === -1) return;
  stack.splice(i, 1);
  el.inert = true;
  sync();
}

export function isTopDialog(el: HTMLElement): boolean {
  return stack[stack.length - 1] === el;
}

export function topDialog(): HTMLElement | undefined {
  return stack[stack.length - 1];
}
