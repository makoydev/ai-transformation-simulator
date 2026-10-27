/**
 * Screen reader announcements, read out by the one permanent live region (LiveRegion.tsx).
 * A live region only announces changes to content that was already on the page, so toasts and
 * the quarter card send their text here instead of carrying their own aria-live.
 */
export interface Announcement {
  id: number;
  text: string;
  /** Errors interrupt; everything else waits for the screen reader to finish. */
  assertive: boolean;
  at: number;
}

// Messages sent this close together are read as one, so the second doesn't cut off the first.
const JOIN_MS = 250;

let current: Announcement = { id: 0, text: '', assertive: false, at: 0 };
const listeners = new Set<() => void>();

export function announce(text: string, assertive = false) {
  const now = Date.now();
  const join = current.text && current.assertive === assertive && now - current.at < JOIN_MS;
  current = { id: current.id + 1, text: join ? `${current.text} ${text}` : text, assertive, at: now };
  listeners.forEach((l) => l());
}

export function subscribeAnnouncements(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const currentAnnouncement = () => current;
