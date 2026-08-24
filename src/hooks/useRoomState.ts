import { useCallback, useSyncExternalStore } from 'react';
import type { RoomState } from '../store/RoomStore';
import { useRoomStoreContext } from '../store/RoomStoreContext';

const LOADING_STATE: RoomState = { status: 'loading' };

export function useRoomState(roomId: string | undefined): RoomState {
  const store = useRoomStoreContext();

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!roomId) return () => {};
      return store.subscribeToRoom(roomId, callback);
    },
    [store, roomId],
  );

  const getSnapshot = useCallback(() => {
    return roomId ? store.getRoomSnapshot(roomId) : LOADING_STATE;
  }, [store, roomId]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
