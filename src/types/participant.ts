export interface Selection {
  itemId: string;
  /** Claimed weight for this item — 1 on a plain tap; can be a partial unit count. */
  units: number;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  selections: Selection[];
  customTipPercentage?: number;
  /** Self-reported: this participant has sent the host their share. */
  paid: boolean;
}
