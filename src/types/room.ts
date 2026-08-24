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
  /**
   * Uid of whoever scanned the receipt and opened the room — the only person
   * allowed to edit the bill items. Not a "host": nobody organises or collects
   * here, everyone settles their own share equally.
   *
   * Kept as `hostId` because it's a stored Firestore field referenced by name in
   * `firestore.rules`; renaming it would break every existing room. Authorization
   * must always come from this field, never a participant's own claim.
   */
  hostId: string;
  billData: BillData;
  settings: RoomSettings;
  participants: Record<string, Participant>;
}
