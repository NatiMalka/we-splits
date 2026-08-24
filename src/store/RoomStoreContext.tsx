import { createContext, useContext, type ReactNode } from 'react';
import type { RoomStore } from './RoomStore';
import { roomStore } from './FirestoreRoomStore';

const RoomStoreContext = createContext<RoomStore>(roomStore);

export function RoomStoreProvider({ children }: { children: ReactNode }) {
  return <RoomStoreContext.Provider value={roomStore}>{children}</RoomStoreContext.Provider>;
}

export function useRoomStoreContext(): RoomStore {
  return useContext(RoomStoreContext);
}
