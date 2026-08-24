import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/layout/GlassCard';
import { ItemList } from '../components/review/ItemList';
import { AddItemButton } from '../components/review/AddItemButton';
import { TipPercentageSelector } from '../components/review/TipPercentageSelector';
import { ServiceFeeBanner } from '../components/review/ServiceFeeBanner';
import { TotalMismatchWarning } from '../components/review/TotalMismatchWarning';
import { HostNameInput } from '../components/review/HostNameInput';
import { ReviewSummaryBar } from '../components/review/ReviewSummaryBar';
import { useDraftBill } from '../draft/DraftBillContext';
import { useRoomStoreContext } from '../store/RoomStoreContext';

export function ReviewScreen() {
  const draft = useDraftBill();
  const navigate = useNavigate();
  const store = useRoomStoreContext();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draft.billData) navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.billData]);

  if (!draft.billData) return null;

  const subtotal = draft.billData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceShare = draft.includeServiceInSplit ? draft.billData.serviceFee : 0;
  const tipAmount = subtotal * (draft.tipPercentage / 100);
  const total = subtotal + serviceShare + tipAmount;

  // Cross-check the parsed items against the total printed on the receipt — the
  // only signal available that the AI misread or dropped a line. Skipped when the
  // AI couldn't read a total at all (0), which would otherwise always "mismatch".
  const printedTotal = draft.billData.rawTotal;
  const parsedTotal = subtotal + draft.billData.serviceFee;
  const mismatch = printedTotal > 0 ? parsedTotal - printedTotal : 0;
  const hasMismatch = Math.abs(mismatch) >= 1;

  async function handleCreateRoom() {
    if (!draft.billData || !draft.hostName.trim()) return;
    setError(null);
    setCreating(true);
    try {
      const { room } = await store.createRoom({
        billData: draft.billData,
        settings: {
          defaultTipPercentage: draft.tipPercentage,
          includeServiceInSplit: draft.includeServiceInSplit,
        },
        hostName: draft.hostName.trim(),
      });
      // The host's participant id is the signed-in auth uid (see useAuthUid) —
      // no separate "remember who I am" step needed here anymore.
      // Don't reset the draft here: ReviewScreen stays mounted during the exit
      // transition, and clearing billData would trigger the redirect-to-"/" guard
      // above, racing with this navigation. The draft is naturally overwritten
      // the next time someone uploads a receipt.
      navigate(`/room/${room.roomId}`);
    } catch (err) {
      console.error('createRoom failed:', err);
      setError('לא הצלחנו ליצור את החדר. נסו שוב.');
      setCreating(false);
    }
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="flex items-center gap-3 pb-4">
          <button onClick={() => navigate('/')} aria-label="חזור" className="text-brand-sand/60">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-lg font-bold text-brand-sand">בדקו את הפריטים</h1>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
          <GlassCard className="p-4">
            <ItemList items={draft.billData.items} onChange={draft.updateItem} onRemove={draft.removeItem} />
            <AddItemButton
              onAdd={() =>
                draft.addItem({ id: crypto.randomUUID(), name: '', quantity: 1, price: 0 })
              }
            />
          </GlassCard>

          {hasMismatch && (
            <TotalMismatchWarning parsedTotal={parsedTotal} printedTotal={printedTotal} />
          )}

          <ServiceFeeBanner
            serviceFee={draft.billData.serviceFee}
            includeInSplit={draft.includeServiceInSplit}
            onToggle={draft.setIncludeServiceInSplit}
          />

          <GlassCard className="flex flex-col gap-3 p-4">
            <p className="text-sm font-medium text-brand-sand/60">אחוז טיפ</p>
            {draft.billData.serviceFee > 0 && (
              <p className="text-xs leading-relaxed text-brand-teal-300">
                שירות כבר נכלל בחשבון — אין צורך בטיפ נוסף. אפשר להוסיף בכל זאת.
              </p>
            )}
            <TipPercentageSelector value={draft.tipPercentage} onChange={draft.setTipPercentage} />
          </GlassCard>

          <HostNameInput value={draft.hostName} onChange={draft.setHostName} />

          {error && <p className="text-center text-sm text-brand-coral-400">{error}</p>}
        </div>

        <ReviewSummaryBar
          subtotal={subtotal + serviceShare}
          tipAmount={tipAmount}
          total={total}
          canSubmit={!creating && draft.hostName.trim().length > 0 && draft.billData.items.length > 0}
          onSubmit={handleCreateRoom}
        />
      </PageTransition>
    </AppShell>
  );
}
