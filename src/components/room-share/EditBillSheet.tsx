import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import type { BillData, BillItem, Room } from '../../types';
import { ItemList } from '../review/ItemList';
import { AddItemButton } from '../review/AddItemButton';
import { Button } from '../ui/Button';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { getItemClaimSummary } from '../../lib/calc/splitEngine';

interface EditBillSheetProps {
  open: boolean;
  room: Room;
  onSave: (billData: BillData) => Promise<void>;
  onClose: () => void;
}

/**
 * Editing a live bill, restricted to whoever scanned the receipt. Everyone else
 * may already have claims against these items, so deleting one silently changes
 * what other people owe — hence the confirmation.
 */
export function EditBillSheet({ open, room, onSave, onClose }: EditBillSheetProps) {
  const [items, setItems] = useState<BillItem[]>(room.billData.items);
  const [pendingDelete, setPendingDelete] = useState<BillItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed whenever the sheet opens so it never shows a stale copy of the bill
  // after someone else's change came through the live subscription.
  useEffect(() => {
    if (open) {
      setItems(room.billData.items);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function claimantCount(itemId: string): number {
    const item = room.billData.items.find((i) => i.id === itemId);
    if (!item) return 0;
    return getItemClaimSummary(item, Object.values(room.participants)).claimants.length;
  }

  function requestRemove(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (claimantCount(itemId) > 0) {
      setPendingDelete(item);
    } else {
      setItems((current) => current.filter((i) => i.id !== itemId));
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...room.billData, items });
      onClose();
    } catch (err) {
      console.error('updateBillData failed:', err);
      setError('לא הצלחנו לשמור את השינויים. נסו שוב.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-brand-charcoal/80 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="עריכת החשבונית"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] justify-center"
            >
              <div className="glass-card-solid flex w-full max-w-md flex-col rounded-b-none p-5">
                <div className="flex items-center justify-between pb-3">
                  <h2 className="font-bold text-brand-sand">עריכת החשבונית</h2>
                  <button type="button" onClick={onClose} aria-label="סגור" className="text-brand-sand/60">
                    <X size={20} />
                  </button>
                </div>

                <p className="pb-3 text-xs leading-relaxed text-brand-sand/50">
                  שינויים כאן משפיעים על כולם בחדר, ומתעדכנים אצלם מיד.
                </p>

                <div className="flex-1 overflow-y-auto">
                  <ItemList
                    items={items}
                    onChange={(item) =>
                      setItems((current) => current.map((i) => (i.id === item.id ? item : i)))
                    }
                    onRemove={requestRemove}
                  />
                  <AddItemButton
                    onAdd={() =>
                      setItems((current) => [
                        ...current,
                        { id: crypto.randomUUID(), name: '', quantity: 1, price: 0 },
                      ])
                    }
                  />
                </div>

                {error && <p className="pt-3 text-center text-sm text-brand-coral-400">{error}</p>}

                <div className="pt-4">
                  <Button fullWidth disabled={saving || items.length === 0} onClick={handleSave}>
                    {saving ? 'שומר...' : 'שמור שינויים'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmSheet
        open={pendingDelete !== null}
        danger
        title="למחוק מנה שכבר נבחרה?"
        body={
          pendingDelete
            ? `${claimantCount(pendingDelete.id)} אנשים בחרו את "${pendingDelete.name || 'המנה הזו'}". מחיקה תסיר אותה מהם והסכום שלהם יקטן.`
            : ''
        }
        confirmLabel="כן, מחק"
        onConfirm={() => {
          if (pendingDelete) setItems((current) => current.filter((i) => i.id !== pendingDelete.id));
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
