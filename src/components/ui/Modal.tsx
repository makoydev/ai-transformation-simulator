import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { isTopDialog, pushDialog, removeDialog, topDialog } from '@/lib/dialogStack';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Visually hidden title for screen readers when the modal has no visible heading id. */
  label: string;
  z?: number;
  /** Change this when the dialog shows new content (e.g. the next event) to scroll back to the top. */
  resetKey?: string;
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab and Shift+Tab cycling inside the dialog. */
function trapTab(e: KeyboardEvent, panel: HTMLElement): void {
  const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
  if (items.length === 0) {
    e.preventDefault();
    panel.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  const inside = active instanceof Node && panel.contains(active);
  if (e.shiftKey && (!inside || active === first || active === panel)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (!inside || active === last)) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * A dialog rendered at the end of <body>. While it is open, everything behind
 * it is inert, Tab stays inside it, and Escape closes only the top dialog.
 * Focus returns to where it was when the dialog closes.
 */
export function Modal({ open, onClose, children, size = 'md', className, label, z = 50, resetKey }: ModalProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Callers pass inline closures; a ref keeps the effect below from re-running on every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const layer = layerRef.current;
    const panel = panelRef.current;
    if (!open || !layer || !panel) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pushDialog(layer);

    const onKey = (e: KeyboardEvent) => {
      if (!isTopDialog(layer)) return;
      if (e.key === 'Escape' && onCloseRef.current) {
        e.preventDefault();
        onCloseRef.current();
      } else if (e.key === 'Tab') {
        trapTab(e, panel);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      removeDialog(layer);
      if (returnTo?.isConnected && !returnTo.closest('[inert]')) {
        returnTo.focus({ preventScroll: true });
      } else {
        topDialog()?.querySelector<HTMLElement>('[role="dialog"]')?.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // Start at the top with focus on the dialog, so its heading is the first thing seen and read.
  // Runs after the effect above, which records where focus was before the dialog opened.
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    panel.scrollTop = 0;
    panel.focus({ preventScroll: true });
  }, [open, resetKey]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={layerRef}
          className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6"
          style={{ zIndex: z }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink-950/75 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={cn(
              'glass-strong relative max-h-[92vh] w-full overflow-y-auto rounded-b-none outline-hidden sm:rounded-2xl',
              SIZES[size],
              className,
            )}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 rounded-lg p-2 text-ink-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
