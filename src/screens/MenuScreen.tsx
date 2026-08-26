import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { MenuScreenHeader } from '../components/menu/MenuScreenHeader';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { QuantitySplitSheet } from '../components/menu/QuantitySplitSheet';
import { LiveTotalsDrawer } from '../components/menu/LiveTotalsDrawer';
import { RoomNotFoundState } from '../components/join/RoomNotFoundState';
import { Spinner } from '../components/ui/Spinner';
import { useRoomState } from '../hooks/useRoomState';
import { useAuthUid } from '../hooks/useAuthUid';
import { useCalculations } from '../hooks/useCalculations';
import { useRedirectWhenClosed } from '../hooks/useRedirectWhenClosed';
import { useRoomStoreContext } from '../store/RoomStoreContext';
import type { BillItem, Room, Selection } from '../types';

export function MenuScreen() {
  const { roomCode = '' } = useParams();
  const roomState = useRoomState(roomCode);
  const uid = useAuthUid();
  const store = useRoomStoreContext();
  const navigate = useNavigate();
  const [quantitySheetItem, setQuantitySheetItem] = useState<BillItem | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const room: Room | null = roomState.status === 'ready' ? roomState.room : null;
  const { totals, progress } = useCalculations(room);
  const isJoined = Boolean(room && uid && room.participants[uid]);
  useRedirectWhenClosed(room, roomCode);

  useEffect(() => {
    if (room && uid && !room.participants[uid]) {
      navigate(`/join/${roomCode}`, { replace: true });
    }
  }, [room, uid, roomCode, navigate]);

  if (roomState.status === 'loading' || uid === null) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </AppShell>
    );
  }

  if (roomState.status === 'not-found') {
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

  if (!isJoined || !room) return null;
  const participantId = uid;
  const me = room.participants[participantId];

  function mySelection(itemId: string): Selection | undefined {
    return me.selections.find((s) => s.itemId === itemId);
  }

  // Firestore answers reads from its local cache, so a rejected write still looks
  // applied on this screen while nobody else ever sees it. Surfacing the failure
  // is the only way the person knows their pick didn't land.
  async function setMyUnits(item: BillItem, units: number) {
    const next = me.selections.filter((s) => s.itemId !== item.id);
    if (units > 0) next.push({ itemId: item.id, units });
    try {
      setSaveError(null);
      await store.updateParticipantSelections(roomCode, participantId, next);
    } catch (err) {
      console.error('updateParticipantSelections failed:', err);
      setSaveError('הבחירה לא נשמרה. בדקו את החיבור ונסו שוב.');
    }
  }

  function toggleClaim(item: BillItem) {
    const existing = mySelection(item.id);
    if (existing) {
      void setMyUnits(item, 0);
    } else {
      void setMyUnits(item, 1);
    }
  }

  const myTotal = totals.find((t) => t.participantId === participantId);
  const allTotals = totals.map((t) => ({
    name: room.participants[t.participantId]?.name ?? '?',
    total: t.total,
  }));

  return (
    <AppShell>
      <PageTransition>
        <div className="flex items-center gap-3 pb-3">
          <MenuScreenHeader restaurantName={room.billData.restaurantName} claimedRatio={progress.claimedRatio} />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="flex flex-1 flex-col gap-2.5 pb-2"
        >
          {room.billData.items.map((item) => {
            const summary = progress.perItem.find((s) => s.itemId === item.id);
            const claimantNames = (summary?.claimants ?? []).map(
              (c) => room.participants[c.participantId]?.name ?? '?',
            );
            return (
              <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <MenuItemCard
                  item={item}
                  claimantNames={claimantNames}
                  isClaimedByMe={Boolean(mySelection(item.id))}
                  onToggleClaim={() => toggleClaim(item)}
                  onOpenQuantitySplit={() => setQuantitySheetItem(item)}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {saveError && (
          <p role="alert" className="pb-2 text-center text-sm text-brand-coral-400">
            {saveError}
          </p>
        )}

        <button
          onClick={() => navigate(`/room/${roomCode}/summary`)}
          className="mb-2 flex items-center justify-center gap-1.5 self-center text-sm font-medium text-brand-sand/60"
        >
          לסיכום שלי
          <ArrowLeft size={14} />
        </button>

        <LiveTotalsDrawer myTotal={myTotal} allTotals={allTotals} />
      </PageTransition>

      <QuantitySplitSheet
        item={quantitySheetItem}
        myUnits={quantitySheetItem ? (mySelection(quantitySheetItem.id)?.units ?? 0) : 0}
        onChangeUnits={(units) => { if (quantitySheetItem) void setMyUnits(quantitySheetItem, units); }}
        onClose={() => setQuantitySheetItem(null)}
      />
    </AppShell>
  );
}
