import { describe, expect, it } from 'vitest';
import { computeBillClaimProgress, computeParticipantTotals, computeUnclaimedAmount, computeUnpaidSummary, getItemClaimSummary } from './splitEngine';
import type { BillItem, Participant, Room } from '../../types';

function item(overrides: Partial<BillItem> = {}): BillItem {
  return { id: 'i1', name: 'מנה', quantity: 1, price: 100, ...overrides };
}

function participant(overrides: Partial<Participant> = {}): Participant {
  return { id: 'p1', name: 'דני', isHost: false, joinedAt: 0, selections: [], paid: false, ...overrides };
}

function room(overrides: Partial<Room> = {}): Room {
  return {
    roomId: 'ABC123',
    createdAt: 0,
    expiresAt: 0,
    status: 'active',
    hostId: 'host',
    billData: { restaurantName: null, currency: 'ILS', serviceFee: 0, rawTotal: 0, items: [] },
    settings: { defaultTipPercentage: 12, includeServiceInSplit: false },
    participants: {},
    ...overrides,
  };
}

describe('getItemClaimSummary', () => {
  it('reports zero weight and zero completion for an unclaimed item', () => {
    const summary = getItemClaimSummary(item(), []);
    expect(summary.totalWeight).toBe(0);
    expect(summary.completionRatio).toBe(0);
    expect(summary.claimants).toHaveLength(0);
  });

  it('splits a shared item evenly between 2 claimants', () => {
    const dish = item({ id: 'shared', quantity: 1, price: 50 });
    const participants = [
      participant({ id: 'a', selections: [{ itemId: 'shared', units: 1 }] }),
      participant({ id: 'b', selections: [{ itemId: 'shared', units: 1 }] }),
    ];
    const summary = getItemClaimSummary(dish, participants);
    expect(summary.totalWeight).toBe(2);
    expect(summary.completionRatio).toBe(1);
  });

  it('splits a shared item evenly between 3 claimants and clamps completion at 1', () => {
    const dish = item({ id: 'shared', quantity: 1, price: 60 });
    const participants = ['a', 'b', 'c'].map((id) =>
      participant({ id, selections: [{ itemId: 'shared', units: 1 }] }),
    );
    const summary = getItemClaimSummary(dish, participants);
    expect(summary.totalWeight).toBe(3);
    expect(summary.completionRatio).toBe(1); // clamped even though totalWeight > quantity
  });

  it('splits a multi-unit item by explicit partial units (2 of 3)', () => {
    const cokes = item({ id: 'coke', quantity: 3, price: 14 });
    const participants = [
      participant({ id: 'a', selections: [{ itemId: 'coke', units: 2 }] }),
      participant({ id: 'b', selections: [{ itemId: 'coke', units: 1 }] }),
    ];
    const summary = getItemClaimSummary(cokes, participants);
    expect(summary.totalWeight).toBe(3);
    expect(summary.completionRatio).toBe(1);
  });
});

describe('computeParticipantTotals', () => {
  it('gives a zero-selection participant a zero total with no division-by-zero', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 0,
        rawTotal: 50,
        items: [item({ id: 'i1', quantity: 1, price: 50 })],
      },
      participants: { p1: participant({ id: 'p1', selections: [] }) },
    });
    const totals = computeParticipantTotals(r);
    expect(totals).toHaveLength(1);
    expect(totals[0].total).toBe(0);
    expect(totals[0].subtotal).toBe(0);
  });

  it('excludes service fee from everyone when includeServiceInSplit is false', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 20,
        rawTotal: 120,
        items: [item({ id: 'i1', quantity: 1, price: 100 })],
      },
      settings: { defaultTipPercentage: 0, includeServiceInSplit: false },
      participants: { p1: participant({ id: 'p1', selections: [{ itemId: 'i1', units: 1 }] }) },
    });
    const totals = computeParticipantTotals(r);
    expect(totals[0].serviceShare).toBe(0);
    expect(totals[0].total).toBe(100);
  });

  it('distributes service fee proportionally when includeServiceInSplit is true', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 30,
        rawTotal: 330,
        items: [
          item({ id: 'i1', quantity: 1, price: 200 }),
          item({ id: 'i2', quantity: 1, price: 100 }),
        ],
      },
      settings: { defaultTipPercentage: 0, includeServiceInSplit: true },
      participants: {
        p1: participant({ id: 'p1', selections: [{ itemId: 'i1', units: 1 }] }),
        p2: participant({ id: 'p2', selections: [{ itemId: 'i2', units: 1 }] }),
      },
    });
    const totals = computeParticipantTotals(r);
    const p1 = totals.find((t) => t.participantId === 'p1')!;
    const p2 = totals.find((t) => t.participantId === 'p2')!;
    expect(p1.serviceShare).toBeCloseTo(20); // 200/300 of the 30 fee
    expect(p2.serviceShare).toBeCloseTo(10); // 100/300 of the 30 fee
  });

  it('applies a per-participant custom tip percentage over the room default', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 0,
        rawTotal: 100,
        items: [item({ id: 'i1', quantity: 1, price: 100 })],
      },
      settings: { defaultTipPercentage: 12, includeServiceInSplit: false },
      participants: {
        p1: participant({ id: 'p1', selections: [{ itemId: 'i1', units: 1 }], customTipPercentage: 20 }),
      },
    });
    const totals = computeParticipantTotals(r);
    expect(totals[0].tipPercentageUsed).toBe(20);
    expect(totals[0].tipAmount).toBeCloseTo(20);
    expect(totals[0].total).toBeCloseTo(120);
  });

  it('reconciles the sum of participant subtotals+service against the raw total, with tip on top', () => {
    const items = [
      item({ id: 'i1', quantity: 2, price: 68 }),
      item({ id: 'i2', quantity: 1, price: 54 }),
    ];
    const subtotalSum = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const serviceFee = Math.round(subtotalSum * 0.1);
    const r = room({
      billData: { restaurantName: null, currency: 'ILS', serviceFee, rawTotal: subtotalSum + serviceFee, items },
      settings: { defaultTipPercentage: 12, includeServiceInSplit: true },
      participants: {
        p1: participant({ id: 'p1', selections: [{ itemId: 'i1', units: 2 }] }),
        p2: participant({ id: 'p2', selections: [{ itemId: 'i2', units: 1 }] }),
      },
    });
    const totals = computeParticipantTotals(r);
    const sumSubtotalAndService = totals.reduce((sum, t) => sum + t.subtotal + t.serviceShare, 0);
    expect(sumSubtotalAndService).toBeCloseTo(r.billData.rawTotal, 5);
  });
});

describe('computeBillClaimProgress', () => {
  it('reports 0% claimed when nothing has been selected', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 0,
        rawTotal: 100,
        items: [item({ id: 'i1', quantity: 1, price: 100 })],
      },
    });
    expect(computeBillClaimProgress(r).claimedRatio).toBe(0);
  });

  it('reports partial progress when only some units of a multi-unit item are claimed', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 0,
        rawTotal: 42,
        items: [item({ id: 'coke', quantity: 3, price: 14 })],
      },
      participants: { p1: participant({ id: 'p1', selections: [{ itemId: 'coke', units: 1 }] }) },
    });
    expect(computeBillClaimProgress(r).claimedRatio).toBeCloseTo(1 / 3);
  });
});

describe('computeUnpaidSummary', () => {
  const items = [item({ id: 'i1', quantity: 1, price: 100 }), item({ id: 'i2', quantity: 1, price: 50 })];

  it('excludes the host from the remaining amount even if unpaid', () => {
    const r = room({
      billData: { restaurantName: null, currency: 'ILS', serviceFee: 0, rawTotal: 150, items },
      settings: { defaultTipPercentage: 0, includeServiceInSplit: false },
      participants: {
        host: participant({ id: 'host', isHost: true, paid: false, selections: [{ itemId: 'i1', units: 1 }] }),
      },
    });
    const totals = computeParticipantTotals(r);
    expect(computeUnpaidSummary(r, totals).remainingAmount).toBe(0);
  });

  it('sums totals only for non-host participants who have not marked themselves paid', () => {
    const r = room({
      billData: { restaurantName: null, currency: 'ILS', serviceFee: 0, rawTotal: 150, items },
      settings: { defaultTipPercentage: 0, includeServiceInSplit: false },
      participants: {
        host: participant({ id: 'host', isHost: true, selections: [] }),
        paidGuest: participant({ id: 'paidGuest', paid: true, selections: [{ itemId: 'i1', units: 1 }] }),
        unpaidGuest: participant({ id: 'unpaidGuest', paid: false, selections: [{ itemId: 'i2', units: 1 }] }),
      },
    });
    const totals = computeParticipantTotals(r);
    const summary = computeUnpaidSummary(r, totals);
    expect(summary.remainingAmount).toBe(50);
    expect(summary.unpaidParticipantIds).toEqual(['unpaidGuest']);
  });
});

describe('computeUnclaimedAmount', () => {
  it('reports the full bill as unclaimed when nobody has selected anything', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 0,
        rawTotal: 150,
        items: [item({ id: 'i1', quantity: 1, price: 100 }), item({ id: 'i2', quantity: 1, price: 50 })],
      },
    });
    expect(computeUnclaimedAmount(r)).toBe(150);
  });

  it('subtracts only the claimed portion of a partially-claimed multi-unit item', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 0,
        rawTotal: 42,
        items: [item({ id: 'coke', quantity: 3, price: 14 })],
      },
      participants: { p1: participant({ id: 'p1', selections: [{ itemId: 'coke', units: 1 }] }) },
    });
    // 1 of 3 units claimed -> 2/3 of the 42 line total remains unclaimed
    expect(computeUnclaimedAmount(r)).toBeCloseTo(28);
  });

  it('reports zero once every item is fully claimed', () => {
    const r = room({
      billData: {
        restaurantName: null,
        currency: 'ILS',
        serviceFee: 0,
        rawTotal: 100,
        items: [item({ id: 'i1', quantity: 1, price: 100 })],
      },
      participants: { p1: participant({ id: 'p1', selections: [{ itemId: 'i1', units: 1 }] }) },
    });
    expect(computeUnclaimedAmount(r)).toBe(0);
  });
});
