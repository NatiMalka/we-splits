import type { BillData } from './bill';
import type { Participant } from './participant';

export type RoomStatus = 'active' | 'completed';

export interface RoomSettings {
  defaultTipPercentage: number;
  includeServiceInSplit: boolean;
  /** Host's Bit/PayBox link, set from the summary screen. */
  hostPaymentLink?: string;
}

export interface Room {
  roomId: string;
  createdAt: number;
  /** TTL cutoff (createdAt + 24h) — Firestore auto-deletes the room at this time. */
  expiresAt: number;
  status: RoomStatus;
  /** Source of truth for "who is host" — never trust a participant's own isHost field for authorization. */
  hostId: string;
  billData: BillData;
  settings: RoomSettings;
  participants: Record<string, Participant>;
}
