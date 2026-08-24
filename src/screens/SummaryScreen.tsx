import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/layout/GlassCard';
import { SummaryItemRow } from '../components/summary/SummaryItemRow';
import { SummaryTotalCard } from '../components/summary/SummaryTotalCard';
import { CopyToWhatsAppButton } from '../components/summary/CopyToWhatsAppButton';
import { HostPaymentLinkInput } from '../components/summary/HostPaymentLinkInput';
import { AllParticipantsSummary } from '../components/summary/AllParticipantsSummary';
import { PaidToggleButton } from '../components/summary/PaidToggleButton';
import { SettleUpCard } from '../components/summary/SettleUpCard';
import { UnclaimedAmountCard } from '../components/summary/UnclaimedAmountCard';
import { RoomNotFoundState } from '../components/join/RoomNotFoundState';
import { Spinner } from '../components/ui/Spinner';
import { useRoomState } from '../hooks/useRoomState';
import { useAuthUid } from '../hooks/useAuthUid';
import { useCalculations } from '../hooks/useCalculations';
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
  const room: Room | null = roomState.status === 'ready' ? roomState.room : null;
  const { totals } = useCalculations(room);

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
    await store.updateRoomSettings(roomCode, { hostPaymentLink: value });
  }

  async function handleTogglePaid(paid: boolean) {
    await store.updateParticipantPaidStatus(roomCode, participantId, paid);
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4 pt-2">
          <h1 className="text-center text-lg font-bold text-brand-sand">הסיכום שלך</h1>

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

          {me && myTotal && <CopyToWhatsAppButton text={buildSummaryShareText(me.name, room.billData.restaurantName, myTotal)} />}

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
        </div>
      </PageTransition>
    </AppShell>
  );
}
