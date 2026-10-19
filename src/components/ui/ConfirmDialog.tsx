import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface Props {
  open: boolean;
  title: string;
  /** What happens if the player confirms, in plain words. */
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Asks before an action that can't be undone. Escape, the backdrop and the close
 * button all cancel, and focus starts on the dialog rather than the confirm button.
 */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" label={title} z={65}>
      <div className="p-6">
        <div className="flex items-start gap-3 pr-8">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-200">
            <AlertTriangle size={20} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <div className="mt-1 text-sm leading-relaxed text-ink-200">{message}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
