import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface Props {
  open: boolean;
  title: string;
  /** What happens if the player confirms, in plain words. */
  message: React.ReactNode;
  confirmLabel: string;
  /** Label for the button that backs out. */
  cancelLabel?: string;
  /** "danger" for actions that can't be undone; "warning" for a heads-up before a normal action. */
  tone?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE_ICON = {
  danger: 'bg-rose-500/15 text-rose-200',
  warning: 'bg-amber-400/15 text-amber-100',
} as const;

/**
 * Asks before an action that can't be undone, or that the player may not mean to take yet.
 * Escape, the backdrop and the close button all cancel, and focus starts on the dialog
 * rather than the confirm button.
 */
export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = 'Cancel', tone = 'danger', onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" label={title} z={65}>
      <div className="p-6">
        <div className="flex items-start gap-3 pr-8">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_ICON[tone]}`}>
            <AlertTriangle size={20} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <div className="mt-1 text-sm leading-relaxed text-ink-200">{message}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
