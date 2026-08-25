import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Room } from '../types';

/**
 * When the bill is closed, everyone still in the room gets moved to the closing
 * screen — not just whoever pressed the button. Firestore pushes the status
 * change to every device, and this turns that into a navigation.
 */
export function useRedirectWhenClosed(room: Room | null, roomCode: string) {
  const navigate = useNavigate();
  const isClosed = room?.status === 'completed';

  useEffect(() => {
    if (isClosed) navigate(`/room/${roomCode}/closed`, { replace: true });
  }, [isClosed, roomCode, navigate]);
}
