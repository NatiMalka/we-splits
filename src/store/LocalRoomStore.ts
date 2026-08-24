import type { BillData, Participant, Room, RoomSettings, Selection } from '../types';
import type { CreateRoomInput, RoomState, RoomStore } from './RoomStore';
import { RoomNotFoundError } from './RoomStore';
import { generateRoomCode } from './roomCode';

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

const CHANNEL_NAME = 'billsplitter:rooms';
const STORAGE_PREFIX = 'billsplitter:room:';

/**
 * localStorage + BroadcastChannel backed RoomStore. An in-memory cache guarantees
 * getRoomSnapshot returns a stable reference between writes (required by
 * useSyncExternalStore) and a fresh reference exactly when the room actually changes.
 */
export class LocalRoomStore implements RoomStore {
  private channel: BroadcastChannel | null =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
  private listeners = new Map<string, Set<(state: RoomState) => void>>();
  private cache = new Map<string, RoomState>();

  constructor() {
    this.channel?.addEventListener('message', (event: MessageEvent<{ roomId: string }>) => {
      this.refreshFromStorage(event.data.roomId);
    });
    // BroadcastChannel doesn't exist in some private-browsing contexts — the
    // native 'storage' event is a cross-tab fallback that still fires there.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith(STORAGE_PREFIX)) {
          this.refreshFromStorage(event.key.slice(STORAGE_PREFIX.length));
        }
      });
    }
  }

  private key(roomId: string): string {
    return `${STORAGE_PREFIX}${roomId}`;
  }

  private readFromStorage(roomId: string): Room | null {
    const raw = localStorage.getItem(this.key(roomId));
    return raw ? (JSON.parse(raw) as Room) : null;
  }

  private toRoomState(room: Room | null): RoomState {
    return room ? { status: 'ready', room } : { status: 'not-found' };
  }

  getRoomSnapshot(roomId: string): RoomState {
    if (!this.cache.has(roomId)) {
      this.cache.set(roomId, this.toRoomState(this.readFromStorage(roomId)));
    }
    return this.cache.get(roomId) ?? { status: 'not-found' };
  }

  private writeRoom(room: Room): void {
    localStorage.setItem(this.key(room.roomId), JSON.stringify(room));
    this.cache.set(room.roomId, { status: 'ready', room });
    this.channel?.postMessage({ roomId: room.roomId });
    // BroadcastChannel never delivers to its own sending tab.
    this.notifyListeners(room.roomId);
  }

  private refreshFromStorage(roomId: string): void {
    this.cache.set(roomId, this.toRoomState(this.readFromStorage(roomId)));
    this.notifyListeners(roomId);
  }

  private notifyListeners(roomId: string): void {
    const state = this.getRoomSnapshot(roomId);
    this.listeners.get(roomId)?.forEach((callback) => callback(state));
  }

  /** Returns a mutable clone — callers mutate freely, then hand it to writeRoom. */
  private requireRoomClone(roomId: string): Room {
    const state = this.getRoomSnapshot(roomId);
    if (state.status !== 'ready') throw new RoomNotFoundError(roomId);
    return structuredClone(state.room);
  }

  async createRoom(input: CreateRoomInput): Promise<{ room: Room; hostParticipantId: string }> {
    let roomId = generateRoomCode();
    while (this.getRoomSnapshot(roomId).status !== 'not-found') {
      roomId = generateRoomCode();
    }

    const hostParticipantId = crypto.randomUUID();
    const createdAt = Date.now();
    const room: Room = {
      roomId,
      createdAt,
      expiresAt: createdAt + ROOM_TTL_MS,
      status: 'active',
      hostId: hostParticipantId,
      billData: input.billData,
      settings: input.settings,
      participants: {
        [hostParticipantId]: {
          id: hostParticipantId,
          name: input.hostName,
          isHost: true,
          joinedAt: Date.now(),
          selections: [],
          paid: false,
        },
      },
    };

    this.writeRoom(room);
    return { room, hostParticipantId };
  }

  async getRoom(roomId: string): Promise<Room | null> {
    const state = this.getRoomSnapshot(roomId);
    return state.status === 'ready' ? state.room : null;
  }

  async joinRoom(roomId: string, name: string): Promise<{ participant: Participant }> {
    const room = this.requireRoomClone(roomId);
    const participant: Participant = {
      id: crypto.randomUUID(),
      name,
      isHost: false,
      joinedAt: Date.now(),
      selections: [],
      paid: false,
    };
    room.participants[participant.id] = participant;
    this.writeRoom(room);
    return { participant };
  }

  async updateParticipantSelections(roomId: string, participantId: string, selections: Selection[]): Promise<void> {
    const room = this.requireRoomClone(roomId);
    const participant = room.participants[participantId];
    if (!participant) throw new Error(`Participant not found: ${participantId}`);
    participant.selections = selections;
    this.writeRoom(room);
  }

  async updateParticipantTip(roomId: string, participantId: string, tipPercentage: number | undefined): Promise<void> {
    const room = this.requireRoomClone(roomId);
    const participant = room.participants[participantId];
    if (!participant) throw new Error(`Participant not found: ${participantId}`);
    participant.customTipPercentage = tipPercentage;
    this.writeRoom(room);
  }

  async updateParticipantPaidStatus(roomId: string, participantId: string, paid: boolean): Promise<void> {
    const room = this.requireRoomClone(roomId);
    const participant = room.participants[participantId];
    if (!participant) throw new Error(`Participant not found: ${participantId}`);
    participant.paid = paid;
    this.writeRoom(room);
  }

  async updateBillData(roomId: string, billData: BillData): Promise<void> {
    const room = this.requireRoomClone(roomId);
    room.billData = billData;
    this.writeRoom(room);
  }

  async updateRoomSettings(roomId: string, settings: Partial<RoomSettings>): Promise<void> {
    const room = this.requireRoomClone(roomId);
    room.settings = { ...room.settings, ...settings };
    this.writeRoom(room);
  }

  subscribeToRoom(roomId: string, callback: (state: RoomState) => void): () => void {
    if (!this.listeners.has(roomId)) this.listeners.set(roomId, new Set());
    this.listeners.get(roomId)!.add(callback);
    return () => {
      this.listeners.get(roomId)?.delete(callback);
    };
  }
}

export const roomStore: RoomStore = new LocalRoomStore();
