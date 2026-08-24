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
  total: number;
  tipPercentageUsed: number;
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

  return participants.map((participant) => {
    const subtotal = perParticipantSubtotal.get(participant.id) ?? 0;
    const breakdown = perParticipantBreakdown.get(participant.id) ?? [];

    let serviceShare = 0;
    if (room.settings.includeServiceInSplit && room.billData.serviceFee > 0 && claimedSubtotalTotal > 0) {
      serviceShare = room.billData.serviceFee * (subtotal / claimedSubtotalTotal);
    }

    const tipPercentageUsed = participant.customTipPercentage ?? room.settings.defaultTipPercentage;
    const tipAmount = subtotal * (tipPercentageUsed / 100);
    const total = subtotal + serviceShare + tipAmount;

    return {
      participantId: participant.id,
      itemBreakdown: breakdown,
      subtotal,
      serviceShare,
      tipAmount,
      total,
      tipPercentageUsed,
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

export interface UnpaidSummary {
  /** Sum of totals owed by non-host participants who haven't marked themselves paid. */
  remainingAmount: number;
  unpaidParticipantIds: string[];
}

/**
 * The host doesn't owe themselves — only non-host participants count toward what's
 * still outstanding.
 */
export function computeUnpaidSummary(
  room: Pick<Room, 'participants'>,
  totals: ParticipantTotal[],
): UnpaidSummary {
  let remainingAmount = 0;
  const unpaidParticipantIds: string[] = [];

  for (const total of totals) {
    const participant = room.participants[total.participantId];
    if (!participant || participant.isHost || participant.paid) continue;
    remainingAmount += total.total;
    unpaidParticipantIds.push(participant.id);
  }

  return { remainingAmount, unpaidParticipantIds };
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
