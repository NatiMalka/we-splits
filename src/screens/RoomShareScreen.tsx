import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { RoomCodeBadge } from '../components/room-share/RoomCodeBadge';
import { QRCodeCard } from '../components/room-share/QRCodeCard';
import { ShareLinkButton } from '../components/room-share/ShareLinkButton';
import { ParticipantJoinFeed } from '../components/room-share/ParticipantJoinFeed';
import { HostControls } from '../components/room-share/HostControls';
import { RoomNotFoundState } from '../components/join/RoomNotFoundState';
import { Spinner } from '../components/ui/Spinner';
import { useRoomState } from '../hooks/useRoomState';

export function RoomShareScreen() {
  const { roomCode = '' } = useParams();
  const roomState = useRoomState(roomCode);
  const navigate = useNavigate();

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
        </div>

        <HostControls
          onGoToMenu={() => navigate(`/room/${room.roomId}/menu`)}
          onGoToSummary={() => navigate(`/room/${room.roomId}/summary`)}
        />
      </PageTransition>
    </AppShell>
  );
}
