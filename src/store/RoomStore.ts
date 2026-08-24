import type { BillData, Participant, Room, RoomSettings, Selection } from '../types';

export interface CreateRoomInput {
  billData: BillData;
  settings: RoomSettings;
  /** Name of whoever scanned the receipt and is opening the room. */
  creatorName: string;
}

export class RoomNotFoundError extends Error {
  constructor(roomId: string) {
    super(`Room not found: ${roomId}`);
    this.name = 'RoomNotFoundError';
  }
}

/**
 * Tri-state, not a bare nullable: real (Firestore) reads are async, so a room can be
 * "not yet known" as well as "found" or "confirmed missing" — collapsing those into
 * `Room | null` makes every consumer's `if (!room)` guard misfire as a false
 * not-found during the real network round trip. `LocalRoomStore` never produces
 * 'loading' since its reads are synchronous, but still returns this same shape.
 */
export type RoomState = { status: 'loading' } | { status: 'not-found' } | { status: 'ready'; room: Room };

/**
 * Data-access seam: every method here is Promise-based (except the required-sync
 * getRoomSnapshot, needed for useSyncExternalStore) so a future FirestoreRoomStore
 * implementation drops in without touching any UI code.
 */
export interface RoomStore {
  createRoom(input: CreateRoomInput): Promise<{ room: Room; creatorParticipantId: string }>;
  getRoom(roomId: string): Promise<Room | null>;
  getRoomSnapshot(roomId: string): RoomState;
  joinRoom(roomId: string, name: string): Promise<{ participant: Participant }>;
  updateParticipantSelections(roomId: string, participantId: string, selections: Selection[]): Promise<void>;
  updateParticipantTip(roomId: string, participantId: string, tipPercentage: number | undefined): Promise<void>;
  updateParticipantPaidStatus(roomId: string, participantId: string, paid: boolean): Promise<void>;
  updateBillData(roomId: string, billData: BillData): Promise<void>;
  updateRoomSettings(roomId: string, settings: Partial<RoomSettings>): Promise<void>;
  subscribeToRoom(roomId: string, callback: (state: RoomState) => void): () => void;
}
