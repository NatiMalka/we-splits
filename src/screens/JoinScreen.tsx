import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { JoinForm } from '../components/join/JoinForm';
import { RoomNotFoundState } from '../components/join/RoomNotFoundState';
import { RoomLoadingState } from '../components/ui/RoomLoadingState';
import { useRoomState } from '../hooks/useRoomState';
import { useAuthUid } from '../hooks/useAuthUid';
import { useRoomStoreContext } from '../store/RoomStoreContext';

export function JoinScreen() {
  const { roomCode = '' } = useParams();
  const roomState = useRoomState(roomCode);
  const uid = useAuthUid();
  const store = useRoomStoreContext();
  const navigate = useNavigate();

  const alreadyJoined = roomState.status === 'ready' && uid !== null && Boolean(roomState.room.participants[uid]);

  useEffect(() => {
    if (alreadyJoined) navigate(`/room/${roomCode}/menu`, { replace: true });
  }, [alreadyJoined, roomCode, navigate]);

  if (roomState.status === 'loading' || uid === null) {
    return (
      <AppShell>
        <PageTransition>
          <RoomLoadingState />
        </PageTransition>
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

  if (alreadyJoined) {
    return (
      <AppShell>
        <PageTransition>
          <RoomLoadingState />
        </PageTransition>
      </AppShell>
    );
  }

  // Intentionally lets a failure throw: JoinForm owns the pending and error UI,
  // and swallowing it here would leave the button spinning forever.
  async function handleJoin(name: string) {
    await store.joinRoom(roomCode, name);
    navigate(`/room/${roomCode}/menu`);
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="flex flex-1 items-center justify-center">
          <JoinForm room={roomState.room} onJoin={handleJoin} />
        </div>
      </PageTransition>
    </AppShell>
  );
}
