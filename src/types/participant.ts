export interface Selection {
  itemId: string;
  /** Claimed weight for this item — 1 on a plain tap; can be a partial unit count. */
  units: number;
}

export interface Participant {
  id: string;
  name: string;
  /**
   * Whoever scanned the receipt and opened the room. Carries no social status —
   * this app is for diners splitting a bill between themselves, so there is no
   * host and nobody collecting. It only grants permission to edit the bill items.
   *
   * Always derived from `Room.hostId`, never read from the stored participant
   * field, which a client could forge.
   */
  isCreator: boolean;
  joinedAt: number;
  selections: Selection[];
  customTipPercentage?: number;
  /** Self-reported: "I've settled my share." Applies to everyone equally. */
  paid: boolean;
}
