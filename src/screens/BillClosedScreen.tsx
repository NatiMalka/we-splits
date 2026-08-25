import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { ThanksHero } from '../components/closed/ThanksHero';
import { FinalBillCard } from '../components/closed/FinalBillCard';
import { ShareAppButton } from '../components/closed/ShareAppButton';
import { Confetti } from '../components/closed/Confetti';
import { RoomNotFoundState } from '../components/join/RoomNotFoundState';
import { Spinner } from '../components/ui/Spinner';
import { useRoomState } from '../hooks/useRoomState';
import { useAuthUid } from '../hooks/useAuthUid';
import { useCalculations } from '../hooks/useCalculations';
import type { Room } from '../types';

/**
 * Where everyone lands once the bill is closed — the last thing people see, so
 * it's meant to feel like a clean ending rather than a dead end.
 */
export function BillClosedScreen() {
  const { roomCode = '' } = useParams();
  const roomState = useRoomState(roomCode);
  const uid = useAuthUid();
  const navigate = useNavigate();
  const room: Room | null = roomState.status === 'ready' ? roomState.room : null;
  const { totals } = useCalculations(room);

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

  const rows = totals
    .map((t) => {
      const participant = room.participants[t.participantId];
      return {
        participantId: t.participantId,
        name: participant?.name ?? '?',
        total: t.total,
        paid: participant?.paid ?? false,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <AppShell>
      <Confetti />
      <PageTransition>
        <div className="flex flex-1 flex-col justify-center gap-6 py-8">
          <ThanksHero restaurantName={room.billData.restaurantName} />

          <FinalBillCard rows={rows} restaurantName={room.billData.restaurantName} myParticipantId={uid} />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-2.5"
          >
            <ShareAppButton />
            <button
              type="button"
              onClick={() => navigate('/')}
              className="py-2 text-sm font-medium text-brand-sand/50"
            >
              חשבון חדש
            </button>
          </motion.div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
