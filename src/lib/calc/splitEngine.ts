import type { BillItem, Participant, Room } from '../../types';

export interface ItemClaimSummary {
  itemId: string;
  totalWeight: number;
  /** clamp(totalWeight / item.quantity, 0, 1) */
  completionRatio: number;
  claimants: { participantId: string; units: number }[];
}

export function getItemClaimSummary(item: BillItem, participants: Participant[]): ItemClaimSummary {
  const claimants: { participantId: string; units: number }[] = [];
  let totalWeight = 0;

  for (const participant of participants) {
    const selection = participant.selections.find((s) => s.itemId === item.id);
    if (selection && selection.units > 0) {
      claimants.push({ participantId: participant.id, units: selection.units });
      totalWeight += selection.units;
    }
  }

  const completionRatio = item.quantity > 0 ? Math.min(1, Math.max(0, totalWeight / item.quantity)) : 0;

  return { itemId: item.id, totalWeight, completionRatio, claimants };
}

export interface ParticipantTotal {
  participantId: string;
  itemBreakdown: { itemId: string; itemName: string; units: number; amount: number }[];
  subtotal: number;
  serviceShare: number;
  tipAmount: number;
  /** Exact share before whole-shekel rounding — keeps the arithmetic auditable. */
  exactTotal: number;
  /** What this person actually pays: `exactTotal` rounded to whole shekels. */
  total: number;
  /** `total - exactTotal`. Non-zero when rounding moved this person's amount. */
  roundingAdjustment: number;
  tipPercentageUsed: number;
}

/**
 * Turns exact fractional shares into whole shekels that still add up to the bill.
 *
 * Nobody pays fractional agorot, but naively rounding each person independently
 * makes the parts stop matching the whole (₪100 split three ways displays as
 * 33.33 × 3 = ₪99.99). This uses the largest-remainder method: everyone gets
 * their floor, then the leftover shekels go to whoever was rounded down hardest.
 *
 * Every device computes this independently from the same room data, so the
 * tie-break has to be deterministic — hence sorting by participant id, never by
 * object key order.
 */
function allocateWholeShekels(exact: { participantId: string; exactTotal: number }[]): Map<string, number> {
  const exactSum = exact.reduce((sum, e) => sum + e.exactTotal, 0);
  const target = Math.round(exactSum);

  const floors = exact.map((e) => ({
    participantId: e.participantId,
    floor: Math.floor(e.exactTotal),
    fraction: e.exactTotal - Math.floor(e.exactTotal),
  }));

  const floorSum = floors.reduce((sum, f) => sum + f.floor, 0);
  let leftover = Math.max(0, target - floorSum);

  const byLargestFraction = [...floors].sort(
    (a, b) => b.fraction - a.fraction || a.participantId.localeCompare(b.participantId),
  );

  const allocated = new Map<string, number>(floors.map((f) => [f.participantId, f.floor]));
  for (const entry of byLargestFraction) {
    if (leftover <= 0) break;
    allocated.set(entry.participantId, (allocated.get(entry.participantId) ?? 0) + 1);
    leftover--;
  }

  return allocated;
}

export function computeParticipantTotals(
  room: Pick<Room, 'billData' | 'settings' | 'participants'>,
): ParticipantTotal[] {
  const participants = Object.values(room.participants);
  const claimSummaries = new Map<string, ItemClaimSummary>();
  for (const item of room.billData.items) {
    claimSummaries.set(item.id, getItemClaimSummary(item, participants));
  }

  const itemById = new Map(room.billData.items.map((item) => [item.id, item] as const));

  const perParticipantSubtotal = new Map<string, number>();
  const perParticipantBreakdown = new Map<string, ParticipantTotal['itemBreakdown']>();

  for (const participant of participants) {
    const breakdown: ParticipantTotal['itemBreakdown'] = [];
    let subtotal = 0;

    for (const selection of participant.selections) {
      if (selection.units <= 0) continue;
      const item = itemById.get(selection.itemId);
      if (!item) continue;
      const summary = claimSummaries.get(item.id);
      const totalWeight = summary?.totalWeight ?? 0;
      if (totalWeight <= 0) continue;

      const lineTotal = item.price * item.quantity;
      const amount = (lineTotal * selection.units) / totalWeight;

      breakdown.push({ itemId: item.id, itemName: item.name, units: selection.units, amount });
      subtotal += amount;
    }

    perParticipantSubtotal.set(participant.id, subtotal);
    perParticipantBreakdown.set(participant.id, breakdown);
  }

  const claimedSubtotalTotal = Array.from(perParticipantSubtotal.values()).reduce((a, b) => a + b, 0);

  const exactTotals = participants.map((participant) => {
    const subtotal = perParticipantSubtotal.get(participant.id) ?? 0;

    let serviceShare = 0;
    if (room.settings.includeServiceInSplit && room.billData.serviceFee > 0 && claimedSubtotalTotal > 0) {
      serviceShare = room.billData.serviceFee * (subtotal / claimedSubtotalTotal);
    }

    const tipPercentageUsed = participant.customTipPercentage ?? room.settings.defaultTipPercentage;
    const tipAmount = subtotal * (tipPercentageUsed / 100);

    return {
      participantId: participant.id,
      subtotal,
      serviceShare,
      tipAmount,
      tipPercentageUsed,
      exactTotal: subtotal + serviceShare + tipAmount,
    };
  });

  const rounded = allocateWholeShekels(exactTotals);

  return exactTotals.map((entry) => {
    const total = rounded.get(entry.participantId) ?? Math.round(entry.exactTotal);
    return {
      participantId: entry.participantId,
      itemBreakdown: perParticipantBreakdown.get(entry.participantId) ?? [],
      subtotal: entry.subtotal,
      serviceShare: entry.serviceShare,
      tipAmount: entry.tipAmount,
      exactTotal: entry.exactTotal,
      total,
      roundingAdjustment: total - entry.exactTotal,
      tipPercentageUsed: entry.tipPercentageUsed,
    };
  });
}

export function computeBillClaimProgress(
  room: Pick<Room, 'billData' | 'participants'>,
): { claimedRatio: number; perItem: ItemClaimSummary[] } {
  const participants = Object.values(room.participants);
  const perItem = room.billData.items.map((item) => getItemClaimSummary(item, participants));

  const totalUnits = room.billData.items.reduce((sum, item) => sum + item.quantity, 0);
  const claimedUnits = perItem.reduce((sum, summary, i) => {
    const item = room.billData.items[i];
    return sum + Math.min(summary.totalWeight, item.quantity);
  }, 0);

  const claimedRatio = totalUnits > 0 ? claimedUnits / totalUnits : 0;

  return { claimedRatio, perItem };
}

export interface SettleUpStatus {
  /** How much of the bill still isn't marked as settled. */
  unpaidAmount: number;
  unpaidParticipantIds: string[];
  paidCount: number;
  /** Everyone who owes something — people who claimed nothing aren't counted. */
  owingCount: number;
}

/**
 * Everyone at the table is equal here: this app is for diners sorting a receipt
 * between themselves, so there is nobody "collecting" and nobody exempt. Whoever
 * scanned the receipt settles up exactly like everyone else.
 */
export function computeSettleUpStatus(
  room: Pick<Room, 'participants'>,
  totals: ParticipantTotal[],
): SettleUpStatus {
  let unpaidAmount = 0;
  let paidCount = 0;
  let owingCount = 0;
  const unpaidParticipantIds: string[] = [];

  for (const total of totals) {
    const participant = room.participants[total.participantId];
    // Someone who claimed nothing owes nothing — they shouldn't drag the
    // "everyone settled" state down by never ticking a box.
    if (!participant || total.total <= 0) continue;

    owingCount++;
    if (participant.paid) {
      paidCount++;
    } else {
      unpaidAmount += total.total;
      unpaidParticipantIds.push(participant.id);
    }
  }

  return { unpaidAmount, unpaidParticipantIds, paidCount, owingCount };
}

/** ₪ value of the bill nobody has claimed yet — the money-amount counterpart to
 * computeBillClaimProgress's unit-based ratio, e.g. for a "still unclaimed" card. */
export function computeUnclaimedAmount(room: Pick<Room, 'billData' | 'participants'>): number {
  const participants = Object.values(room.participants);
  let unclaimed = 0;

  for (const item of room.billData.items) {
    const summary = getItemClaimSummary(item, participants);
    const lineTotal = item.price * item.quantity;
    const claimedRatio = item.quantity > 0 ? Math.min(1, summary.totalWeight / item.quantity) : 0;
    unclaimed += lineTotal * (1 - claimedRatio);
  }

  return unclaimed;
}
