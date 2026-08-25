import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/layout/GlassCard';
import { SummaryItemRow } from '../components/summary/SummaryItemRow';
import { SummaryTotalCard } from '../components/summary/SummaryTotalCard';
import { HostPaymentLinkInput } from '../components/summary/HostPaymentLinkInput';
import { AllParticipantsSummary } from '../components/summary/AllParticipantsSummary';
import { PaidToggleButton } from '../components/summary/PaidToggleButton';
import { ShareSummaryButton } from '../components/summary/ShareSummaryButton';
import { RoomFooterActions } from '../components/summary/RoomFooterActions';
import { SettleUpCard } from '../components/summary/SettleUpCard';
import { UnclaimedAmountCard } from '../components/summary/UnclaimedAmountCard';
import { RoomNotFoundState } from '../components/join/RoomNotFoundState';
import { Spinner } from '../components/ui/Spinner';
import { useRoomState } from '../hooks/useRoomState';
import { useAuthUid } from '../hooks/useAuthUid';
import { useCalculations } from '../hooks/useCalculations';
import { useRedirectWhenClosed } from '../hooks/useRedirectWhenClosed';
import { useRoomStoreContext } from '../store/RoomStoreContext';
import { buildSummaryShareText } from '../lib/whatsapp';
import { computeUnclaimedAmount, computeSettleUpStatus } from '../lib/calc/splitEngine';
import { FEATURES } from '../lib/featureFlags';
import type { Room } from '../types';

export function SummaryScreen() {
  const { roomCode = '' } = useParams();
  const roomState = useRoomState(roomCode);
  const uid = useAuthUid();
  const store = useRoomStoreContext();
  const navigate = useNavigate();
  const room: Room | null = roomState.status === 'ready' ? roomState.room : null;
  const { totals } = useCalculations(room);
  useRedirectWhenClosed(room, roomCode);

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState('');
  const seededPaymentLink = useRef(false);
  useEffect(() => {
    if (!seededPaymentLink.current && room) {
      setPaymentLink(room.settings.hostPaymentLink ?? '');
      seededPaymentLink.current = true;
    }
  }, [room]);

  if (roomState.status === 'loading' || uid === null) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </AppShell>
    );
  }

  if (roomState.status === 'not-found' || !room) {
    return (
      <AppShell>
        <PageTransition>
          <div className="flex flex-1 items-center justify-center">
            <RoomNotFoundState />
          </div>
        </PageTransition>
      </AppShell>
    );
  }

  const participantId = uid;
  const me = room.participants[participantId];
  const myTotal = totals.find((t) => t.participantId === participantId);
  // Not a "host" — nobody hosts anything here. This is only "did I scan the
  // receipt", which is what grants permission to edit the bill items.
  const canEditBill = participantId === room.hostId;

  const allTotals = totals.map((t) => {
    const participant = room.participants[t.participantId];
    return {
      participantId: t.participantId,
      name: participant?.name ?? '?',
      total: t.total,
      paid: participant?.paid ?? false,
    };
  });

  const settleUp = computeSettleUpStatus(room, totals);
  const unclaimedAmount = computeUnclaimedAmount(room);

  async function handlePaymentLinkChange(value: string) {
    setPaymentLink(value);
    try {
      await store.updateRoomSettings(roomCode, { hostPaymentLink: value });
    } catch (err) {
      console.error('updateRoomSettings failed:', err);
      setActionError('לא הצלחנו לשמור את הלינק.');
    }
  }

  // Firestore serves reads from a local cache, so a rejected write leaves the UI
  // looking like it succeeded. Without this, a failure is completely invisible.
  async function handleTogglePaid(paid: boolean) {
    setActionError(null);
    try {
      await store.updateParticipantPaidStatus(roomCode, participantId, paid);
    } catch (err) {
      console.error('updateParticipantPaidStatus failed:', err);
      setActionError('לא הצלחנו לעדכן. בדקו את החיבור ונסו שוב.');
    }
  }

  async function handleCloseBill() {
    setActionError(null);
    setBusy(true);
    try {
      await store.setRoomStatus(roomCode, 'completed');
      // No navigate() here — useRedirectWhenClosed moves everyone, including us,
      // once the status change comes back through the live subscription.
    } catch (err) {
      console.error('setRoomStatus failed:', err);
      setActionError('לא הצלחנו לסגור את החשבון. נסו שוב.');
      setBusy(false);
    }
  }

  async function handleLeaveRoom() {
    setActionError(null);
    setBusy(true);
    try {
      await store.removeParticipant(roomCode, participantId);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('removeParticipant failed:', err);
      setActionError('לא הצלחנו לעזוב את החדר. נסו שוב.');
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4 pt-2">
          {/* Without a way back, spotting a wrong pick here was a dead end. */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/room/${roomCode}/menu`)}
              aria-label="חזרה לבחירת המנות"
              className="text-brand-sand/60"
            >
              <ArrowRight size={20} />
            </button>
            <h1 className="flex-1 text-lg font-bold text-brand-sand">הסיכום שלך</h1>
          </div>

          {myTotal && myTotal.itemBreakdown.length > 0 && (
            <GlassCard className="p-4">
              {myTotal.itemBreakdown.map((line, i) => (
                <SummaryItemRow key={line.itemId} name={line.itemName} units={line.units} amount={line.amount} index={i} />
              ))}
              {myTotal.serviceShare > 0 && (
                <SummaryItemRow
                  name="דמי שירות"
                  units={1}
                  amount={myTotal.serviceShare}
                  index={myTotal.itemBreakdown.length}
                />
              )}
              {myTotal.tipAmount > 0 && (
                <SummaryItemRow
                  name={`טיפ (${myTotal.tipPercentageUsed}%)`}
                  units={1}
                  amount={myTotal.tipAmount}
                  index={myTotal.itemBreakdown.length + 1}
                />
              )}
              {Math.abs(myTotal.roundingAdjustment) >= 0.01 && (
                <SummaryItemRow
                  name="עיגול לשקל שלם"
                  units={1}
                  amount={myTotal.roundingAdjustment}
                  index={myTotal.itemBreakdown.length + 2}
                />
              )}
            </GlassCard>
          )}

          <SummaryTotalCard total={myTotal?.total ?? 0} />

          <UnclaimedAmountCard unclaimedAmount={unclaimedAmount} />

          {me && myTotal && <ShareSummaryButton text={buildSummaryShareText(me.name, room.billData.restaurantName, myTotal)} />}

          {/* Everyone marks their own — including whoever scanned the receipt. */}
          {me && myTotal && myTotal.total > 0 && (
            <PaidToggleButton paid={me.paid} onToggle={handleTogglePaid} />
          )}

          <SettleUpCard
            unpaidAmount={settleUp.unpaidAmount}
            paidCount={settleUp.paidCount}
            owingCount={settleUp.owingCount}
          />

          {FEATURES.paymentLink && canEditBill && (
            <HostPaymentLinkInput value={paymentLink} onChange={handlePaymentLinkChange} />
          )}

          <AllParticipantsSummary rows={allTotals} />

          {actionError && <p className="text-center text-sm text-brand-coral-400">{actionError}</p>}

          <RoomFooterActions
            canCloseBill={canEditBill}
            unpaidCount={settleUp.unpaidParticipantIds.length}
            onCloseBill={handleCloseBill}
            onLeaveRoom={handleLeaveRoom}
            busy={busy}
          />
        </div>
      </PageTransition>
    </AppShell>
  );
}
