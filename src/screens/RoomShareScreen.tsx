import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { RoomCodeBadge } from '../components/room-share/RoomCodeBadge';
import { QRCodeCard } from '../components/room-share/QRCodeCard';
import { ShareLinkButton } from '../components/room-share/ShareLinkButton';
import { ParticipantJoinFeed } from '../components/room-share/ParticipantJoinFeed';
import { HostControls } from '../components/room-share/HostControls';
import { EditBillSheet } from '../components/room-share/EditBillSheet';
import { RoomNotFoundState } from '../components/join/RoomNotFoundState';
import { Spinner } from '../components/ui/Spinner';
import { useRoomState } from '../hooks/useRoomState';
import { useAuthUid } from '../hooks/useAuthUid';
import { useRedirectWhenClosed } from '../hooks/useRedirectWhenClosed';
import { useRoomStoreContext } from '../store/RoomStoreContext';
import type { BillData } from '../types';

export function RoomShareScreen() {
  const { roomCode = '' } = useParams();
  const roomState = useRoomState(roomCode);
  const uid = useAuthUid();
  const store = useRoomStoreContext();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  useRedirectWhenClosed(roomState.status === 'ready' ? roomState.room : null, roomCode);

  if (roomState.status === 'loading') {
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

  const room = roomState.room;
  const joinUrl = `${window.location.origin}/join/${room.roomId}`;
  // Only whoever scanned the receipt may edit it, so prices can't shift under
  // the group while people are picking.
  const canEditBill = uid === room.hostId;

  async function handleSaveBill(billData: BillData) {
    await store.updateBillData(roomCode, billData);
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
          <div className="text-center">
            <p className="text-sm text-brand-sand/50">קוד החדר</p>
            <div className="mt-2">
              <RoomCodeBadge code={room.roomId} />
            </div>
          </div>

          <QRCodeCard url={joinUrl} />
          <div className="w-full">
            <ShareLinkButton url={joinUrl} />
          </div>
          <div className="w-full">
            <ParticipantJoinFeed participants={Object.values(room.participants)} />
          </div>

          {canEditBill && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-sand/50"
            >
              <Pencil size={14} />
              עריכת החשבונית
            </button>
          )}
        </div>

        <HostControls
          onGoToMenu={() => navigate(`/room/${room.roomId}/menu`)}
          onGoToSummary={() => navigate(`/room/${room.roomId}/summary`)}
        />
      </PageTransition>

      <EditBillSheet
        open={editing}
        room={room}
        onSave={handleSaveBill}
        onClose={() => setEditing(false)}
      />
    </AppShell>
  );
}
