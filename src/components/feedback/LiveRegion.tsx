import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { currentAnnouncement, subscribeAnnouncements } from '@/lib/announce';

/**
 * The app's one pair of live regions, always on the page so screen readers notice when their
 * text changes. Rendered at the end of <body>, outside the app root that dialogs make inert.
 */
export function LiveRegion() {
  const a = useSyncExternalStore(subscribeAnnouncements, currentAnnouncement);
  // A trailing no-break space on every other message, so a repeat of the same text still counts as a change.
  const text = a.text + (a.id % 2 ? ' ' : '');
  return createPortal(
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {a.assertive ? '' : text}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {a.assertive ? text : ''}
      </div>
    </>,
    document.body,
  );
}
