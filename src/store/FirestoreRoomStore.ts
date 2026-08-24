import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { BillData, Participant, Room, RoomSettings, Selection } from '../types';
import type { CreateRoomInput, RoomState, RoomStore } from './RoomStore';
import { RoomNotFoundError } from './RoomStore';
import { generateRoomCode } from './roomCode';

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
// A few seconds of grace before actually tearing down Firestore listeners after
// the last subscriber unmounts — route transitions within the same room (e.g.
// Menu -> Summary) can bounce the refcount 1 -> 0 -> 1 in a single tick, and a
// hard teardown would re-pay the initial load round trip every time that happens.
const TEARDOWN_GRACE_MS = 4000;

const LOADING_STATE: RoomState = { status: 'loading' };

type RawParticipant = Omit<Participant, 'isCreator'>;
type RoomFields = Omit<Room, 'participants'>;

interface RoomSubscription {
  refCount: number;
  teardownTimer: ReturnType<typeof setTimeout> | null;
  roomFields: RoomFields | null | undefined; // undefined = not loaded yet, null = confirmed missing
  participants: Record<string, RawParticipant> | undefined;
  unsubRoom: () => void;
  unsubParticipants: () => void;
}

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in yet — cannot perform this operation before auth resolves.');
  return uid;
}

function parseRoomDoc(data: DocumentData): RoomFields {
  return {
    roomId: data.roomId,
    createdAt: (data.createdAt as Timestamp).toMillis(),
    expiresAt: (data.expiresAt as Timestamp).toMillis(),
    status: data.status,
    hostId: data.hostId,
    billData: data.billData as BillData,
    settings: data.settings as RoomSettings,
  };
}

function parseParticipantDoc(id: string, data: DocumentData): RawParticipant {
  return {
    id,
    name: data.name,
    joinedAt: (data.joinedAt as Timestamp).toMillis(),
    selections: (data.selections as Selection[]) ?? [],
    customTipPercentage: data.customTipPercentage,
    paid: Boolean(data.paid),
  };
}

/**
 * Firestore + Anonymous Auth backed RoomStore. There is no server in this
 * architecture (Cloud Functions require the paid Blaze plan) — Firestore security
 * rules are the only enforcement layer, so writes here are deliberately narrow:
 * every mutation touches only the fields rules allow for the current uid.
 */
export class FirestoreRoomStore implements RoomStore {
  private cache = new Map<string, RoomState>();
  private listeners = new Map<string, Set<(state: RoomState) => void>>();
  private subscriptions = new Map<string, RoomSubscription>();

  private setState(roomId: string, state: RoomState): void {
    this.cache.set(roomId, state);
    this.listeners.get(roomId)?.forEach((callback) => callback(state));
  }

  /** Combine-latest: only emit once both the room doc and participants have each loaded once. */
  private recompute(roomId: string): void {
    const sub = this.subscriptions.get(roomId);
    if (!sub) return;

    if (sub.roomFields === undefined) return; // room doc not loaded yet
    if (sub.roomFields === null) {
      this.setState(roomId, { status: 'not-found' });
      return;
    }
    if (sub.participants === undefined) return; // participants not loaded yet

    const hostId = sub.roomFields.hostId;
    const participants: Record<string, Participant> = {};
    for (const [id, raw] of Object.entries(sub.participants)) {
      participants[id] = { ...raw, isCreator: id === hostId };
    }

    this.setState(roomId, { status: 'ready', room: { ...sub.roomFields, participants } });
  }

  getRoomSnapshot(roomId: string): RoomState {
    // Must be a stable reference, not a fresh object per call — useSyncExternalStore
    // treats a changed reference as a change and would otherwise loop forever
    // while waiting for the first onSnapshot callback to populate the cache.
    return this.cache.get(roomId) ?? LOADING_STATE;
  }

  private ensureSubscription(roomId: string): void {
    const existing = this.subscriptions.get(roomId);
    if (existing) {
      existing.refCount++;
      if (existing.teardownTimer) {
        clearTimeout(existing.teardownTimer);
        existing.teardownTimer = null;
      }
      return;
    }

    const sub: RoomSubscription = {
      refCount: 1,
      teardownTimer: null,
      roomFields: undefined,
      participants: undefined,
      unsubRoom: () => {},
      unsubParticipants: () => {},
    };
    this.subscriptions.set(roomId, sub);

    sub.unsubRoom = onSnapshot(
      doc(db, 'rooms', roomId),
      (snap) => {
        sub.roomFields = snap.exists() ? parseRoomDoc(snap.data()) : null;
        this.recompute(roomId);
      },
      () => {
        // Permission-denied (e.g. TTL deleted the room while this tab was open) —
        // treat identically to a confirmed-missing document, not stale data forever.
        sub.roomFields = null;
        this.recompute(roomId);
      },
    );

    sub.unsubParticipants = onSnapshot(
      collection(db, 'rooms', roomId, 'participants'),
      (snap) => {
        const participants: Record<string, RawParticipant> = {};
        snap.forEach((docSnap) => {
          participants[docSnap.id] = parseParticipantDoc(docSnap.id, docSnap.data());
        });
        sub.participants = participants;
        this.recompute(roomId);
      },
      () => {
        sub.participants = {};
        this.recompute(roomId);
      },
    );
  }

  private releaseSubscription(roomId: string): void {
    const sub = this.subscriptions.get(roomId);
    if (!sub) return;
    sub.refCount--;
    if (sub.refCount > 0) return;

    sub.teardownTimer = setTimeout(() => {
      const current = this.subscriptions.get(roomId);
      if (current && current.refCount <= 0) {
        current.unsubRoom();
        current.unsubParticipants();
        this.subscriptions.delete(roomId);
      }
    }, TEARDOWN_GRACE_MS);
  }

  subscribeToRoom(roomId: string, callback: (state: RoomState) => void): () => void {
    if (!this.listeners.has(roomId)) this.listeners.set(roomId, new Set());
    this.listeners.get(roomId)!.add(callback);
    this.ensureSubscription(roomId);

    return () => {
      this.listeners.get(roomId)?.delete(callback);
      this.releaseSubscription(roomId);
    };
  }

  async createRoom(input: CreateRoomInput): Promise<{ room: Room; creatorParticipantId: string }> {
    const uid = requireUid();

    let roomId = generateRoomCode();
    while ((await getDoc(doc(db, 'rooms', roomId))).exists()) {
      roomId = generateRoomCode();
    }

    const createdAt = Date.now();
    const expiresAt = createdAt + ROOM_TTL_MS;
    const createdAtTs = Timestamp.fromMillis(createdAt);
    const expiresAtTs = Timestamp.fromMillis(expiresAt);

    const roomRef = doc(db, 'rooms', roomId);
    const creatorRef = doc(db, 'rooms', roomId, 'participants', uid);

    const batch = writeBatch(db);
    batch.set(roomRef, {
      roomId,
      createdAt: createdAtTs,
      expiresAt: expiresAtTs,
      status: 'active',
      hostId: uid,
      billData: input.billData,
      settings: input.settings,
    });
    batch.set(creatorRef, {
      id: uid,
      name: input.creatorName,
      // Vestigial stored field: rules still allow the key, but nothing reads it.
      isHost: true,
      joinedAt: createdAtTs,
      selections: [],
      paid: false,
      expiresAt: expiresAtTs,
    });
    await batch.commit();

    const room: Room = {
      roomId,
      createdAt,
      expiresAt,
      status: 'active',
      hostId: uid,
      billData: input.billData,
      settings: input.settings,
      participants: {
        [uid]: { id: uid, name: input.creatorName, isCreator: true, joinedAt: createdAt, selections: [], paid: false },
      },
    };
    return { room, creatorParticipantId: uid };
  }

  async getRoom(roomId: string): Promise<Room | null> {
    const roomSnap = await getDoc(doc(db, 'rooms', roomId));
    if (!roomSnap.exists()) return null;
    const roomFields = parseRoomDoc(roomSnap.data());

    const participantsSnap = await getDocs(collection(db, 'rooms', roomId, 'participants'));
    const participants: Record<string, Participant> = {};
    participantsSnap.forEach((docSnap) => {
      const raw = parseParticipantDoc(docSnap.id, docSnap.data());
      participants[docSnap.id] = { ...raw, isCreator: docSnap.id === roomFields.hostId };
    });

    return { ...roomFields, participants };
  }

  async joinRoom(roomId: string, name: string): Promise<{ participant: Participant }> {
    const uid = requireUid();
    const roomSnap = await getDoc(doc(db, 'rooms', roomId));
    if (!roomSnap.exists()) throw new RoomNotFoundError(roomId);

    const roomFields = parseRoomDoc(roomSnap.data());
    const joinedAt = Date.now();

    await setDoc(
      doc(db, 'rooms', roomId, 'participants', uid),
      {
        id: uid,
        name,
        // Vestigial stored field kept for rule compatibility; never read back.
        isHost: uid === roomFields.hostId,
        joinedAt: Timestamp.fromMillis(joinedAt),
        selections: [],
        paid: false,
        expiresAt: Timestamp.fromMillis(roomFields.expiresAt),
      },
      { merge: true },
    );

    const participant: Participant = {
      id: uid,
      name,
      isCreator: uid === roomFields.hostId,
      joinedAt,
      selections: [],
      paid: false,
    };
    return { participant };
  }

  async updateParticipantSelections(roomId: string, participantId: string, selections: Selection[]): Promise<void> {
    await setDoc(doc(db, 'rooms', roomId, 'participants', participantId), { selections }, { merge: true });
  }

  async updateParticipantTip(roomId: string, participantId: string, tipPercentage: number | undefined): Promise<void> {
    const ref = doc(db, 'rooms', roomId, 'participants', participantId);
    if (tipPercentage === undefined) {
      await updateDoc(ref, { customTipPercentage: deleteField() });
    } else {
      await setDoc(ref, { customTipPercentage: tipPercentage }, { merge: true });
    }
  }

  async updateParticipantPaidStatus(roomId: string, participantId: string, paid: boolean): Promise<void> {
    await setDoc(doc(db, 'rooms', roomId, 'participants', participantId), { paid }, { merge: true });
  }

  async updateBillData(roomId: string, billData: BillData): Promise<void> {
    await updateDoc(doc(db, 'rooms', roomId), { billData });
  }

  async updateRoomSettings(roomId: string, settings: Partial<RoomSettings>): Promise<void> {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settings)) {
      updates[`settings.${key}`] = value;
    }
    await updateDoc(doc(db, 'rooms', roomId), updates);
  }
}

export const roomStore: RoomStore = new FirestoreRoomStore();
