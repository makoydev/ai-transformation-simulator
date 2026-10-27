import type { KeyboardEvent } from 'react';

/** Where an arrow, Home or End key moves in a list of `count` items, wrapping at the ends. Null for other keys. */
export function nextIndex(key: string, index: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (index + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (index - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/**
 * Arrow-key handler for a radio group or tab list, following the ARIA patterns: arrows, Home
 * and End move focus to another item and select it. Put it on the group element, and give the
 * selected item (or the first, when none is) tabIndex 0 and the rest -1, so Tab enters the
 * group once and leaves it on the next Tab.
 */
export function rovingKeyDown(e: KeyboardEvent<HTMLElement>) {
  // Items hidden at this screen size (display: none) have no offsetParent and are skipped.
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"], [role="tab"]')].filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('disabled'),
  );
  const index = items.indexOf(e.target as HTMLElement);
  if (index < 0) return;
  const next = nextIndex(e.key, index, items.length);
  if (next === null) return;
  e.preventDefault();
  items[next].focus();
  items[next].click();
}

/** tabIndex for item `i` of a roving group: only the selected item, or the first when none is, is tabbable. */
export function rovingTabIndex(selected: boolean, i: number, anySelected: boolean): 0 | -1 {
  return selected || (!anySelected && i === 0) ? 0 : -1;
}
