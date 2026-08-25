import { useState } from 'react';
import { CheckCircle2, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfirmSheet } from '../ui/ConfirmSheet';

interface RoomFooterActionsProps {
  /** Only whoever scanned the receipt can end the bill for everyone. */
  canCloseBill: boolean;
  unpaidCount: number;
  onCloseBill: () => void;
  onLeaveRoom: () => void;
  busy: boolean;
}

export function RoomFooterActions({
  canCloseBill,
  unpaidCount,
  onCloseBill,
  onLeaveRoom,
  busy,
}: RoomFooterActionsProps) {
  const [confirming, setConfirming] = useState<'close' | 'leave' | null>(null);

  return (
    <div className="mt-2 flex flex-col gap-2.5 border-t border-white/5 pt-4">
      {canCloseBill && (
        <Button variant="secondary" fullWidth disabled={busy} onClick={() => setConfirming('close')}>
          <CheckCircle2 size={18} />
          סגור חשבון
        </Button>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => setConfirming('leave')}
        className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-brand-sand/40 disabled:opacity-40"
      >
        <LogOut size={14} />
        עזוב את החדר
      </button>

      <ConfirmSheet
        open={confirming === 'close'}
        title="לסגור את החשבון?"
        body={
          unpaidCount > 0
            ? `${unpaidCount} אנשים עוד לא סימנו ששילמו. סגירה תעביר את כולם למסך הסיום — אפשר עדיין לראות את הסיכום.`
            : 'כולם סימנו ששילמו. סגירה תעביר את כולם למסך הסיום.'
        }
        confirmLabel="כן, סגור"
        onConfirm={() => {
          setConfirming(null);
          onCloseBill();
        }}
        onCancel={() => setConfirming(null)}
      />

      <ConfirmSheet
        open={confirming === 'leave'}
        danger
        title="לעזוב את החדר?"
        body="הבחירות שלך יימחקו, וזה ישנה את הסכום של מי שהתחלק איתך במנות. תמיד אפשר להצטרף מחדש עם הקוד."
        confirmLabel="כן, עזוב"
        onConfirm={() => {
          setConfirming(null);
          onLeaveRoom();
        }}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}
