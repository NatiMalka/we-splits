import { describe, expect, it } from 'vitest';
import { reconcileItems, type ExtractedItem } from './reconcileItems';

/**
 * The real receipt this was found on (ריצי התקוה נהריה, 25/08/26).
 * Printed columns: מחיר (unit) | כמות | סך הכל (row total). Grand total ₪369.
 */
const REAL_RECEIPT: { name: string; quantity: number; unit: number; line: number }[] = [
  { name: 'ערב.חומוס גרגרים', quantity: 1, unit: 38, line: 38 },
  { name: 'לחם הבית', quantity: 1, unit: 14, line: 14 },
  { name: '2 ערב.קבב שיפודי', quantity: 1, unit: 72, line: 72 },
  { name: 'קולה', quantity: 2, unit: 14, line: 28 },
  { name: 'עסקית קטנטנים', quantity: 2, unit: 46, line: 92 },
  { name: 'ערב.שיפוד מולארד', quantity: 1, unit: 46, line: 46 },
  { name: 'ערב.שיפוד כבד עוף', quantity: 1, unit: 37, line: 37 },
  { name: 'ערב.שיפוד פרגית', quantity: 1, unit: 42, line: 42 },
];
const PRINTED_TOTAL = 369;

function lineTotalOf(items: ReturnType<typeof reconcileItems>['items'], name: string): number {
  const item = items.find((i) => i.name === name)!;
  return item.price * item.quantity;
}

function billTotal(items: ReturnType<typeof reconcileItems>['items']): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

describe('reconcileItems', () => {
  it('keeps a correctly-read receipt exactly as it is', () => {
    const extracted: ExtractedItem[] = REAL_RECEIPT.map((r) => ({
      name: r.name,
      quantity: r.quantity,
      unitPrice: r.unit,
      lineTotal: r.line,
    }));

    const result = reconcileItems(extracted, 0, PRINTED_TOTAL);

    expect(result.matchesPrintedTotal).toBe(true);
    expect(result.repairedItemNames).toEqual([]);
    expect(billTotal(result.items)).toBeCloseTo(PRINTED_TOTAL);
  });

  // The actual bug: the row total got read into the unit-price field. Harmless on
  // quantity-1 rows, doubles the row on quantity-2 rows.
  it('repairs row totals mistaken for unit prices (the ₪369 -> ₪489 bug)', () => {
    const extracted: ExtractedItem[] = REAL_RECEIPT.map((r) => ({
      name: r.name,
      quantity: r.quantity,
      // Model read the סך הכל column into both fields.
      unitPrice: r.line,
      lineTotal: r.line,
    }));

    // Confirm the broken reading really is the ₪489 the app showed.
    const broken = extracted.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    expect(broken).toBe(489);

    const result = reconcileItems(extracted, 0, PRINTED_TOTAL);

    expect(result.matchesPrintedTotal).toBe(true);
    expect(billTotal(result.items)).toBeCloseTo(PRINTED_TOTAL);
    expect(lineTotalOf(result.items, 'קולה')).toBeCloseTo(28);
    expect(lineTotalOf(result.items, 'עסקית קטנטנים')).toBeCloseTo(92);
    // Per-unit price is what the engine multiplies, so it must come back to ₪14.
    expect(result.items.find((i) => i.name === 'קולה')!.price).toBeCloseTo(14);
    expect(result.repairedItemNames).toEqual(['קולה', 'עסקית קטנטנים']);
  });

  it('handles a service charge while reconciling', () => {
    const extracted: ExtractedItem[] = [
      { name: 'בורגר', quantity: 2, unitPrice: 136, lineTotal: 136 }, // misread
      { name: 'סלט', quantity: 1, unitPrice: 54, lineTotal: 54 },
    ];
    // 136 + 54 = 190 items, plus 19 service = 209 printed.
    const result = reconcileItems(extracted, 19, 209);

    expect(result.matchesPrintedTotal).toBe(true);
    expect(lineTotalOf(result.items, 'בורגר')).toBeCloseTo(136);
    expect(result.items.find((i) => i.name === 'בורגר')!.price).toBeCloseTo(68);
  });

  it('leaves things alone when no printed total is available to check against', () => {
    const extracted: ExtractedItem[] = [{ name: 'קולה', quantity: 2, unitPrice: 14, lineTotal: 28 }];
    const result = reconcileItems(extracted, 0, 0);

    // Nothing to reconcile against, so the unit-price reading stands as given.
    expect(result.matchesPrintedTotal).toBe(false);
    expect(lineTotalOf(result.items, 'קולה')).toBeCloseTo(28);
    expect(result.repairedItemNames).toEqual([]);
  });

  it('falls back to the unit-price reading when neither interpretation reconciles', () => {
    // A genuinely misread price no amount of column-swapping can fix — this is
    // the case that must still reach the user as a warning.
    const extracted: ExtractedItem[] = [
      { name: 'בורגר', quantity: 1, unitPrice: 20, lineTotal: 20 },
      { name: 'סלט', quantity: 1, unitPrice: 54, lineTotal: 54 },
    ];
    const result = reconcileItems(extracted, 0, 500);

    expect(result.matchesPrintedTotal).toBe(false);
    expect(billTotal(result.items)).toBeCloseTo(74);
  });

  it('copes with a missing row total', () => {
    const extracted: ExtractedItem[] = [
      { name: 'קולה', quantity: 2, unitPrice: 14 },
      { name: 'סלט', quantity: 1, unitPrice: 54 },
    ];
    const result = reconcileItems(extracted, 0, 82);

    expect(result.matchesPrintedTotal).toBe(true);
    expect(lineTotalOf(result.items, 'קולה')).toBeCloseTo(28);
  });

  it('never produces a zero or fractional quantity', () => {
    const extracted: ExtractedItem[] = [
      { name: 'מנה', quantity: 0, unitPrice: 30, lineTotal: 30 },
      { name: 'אחרת', quantity: 2.4, unitPrice: 10, lineTotal: 20 },
    ];
    const result = reconcileItems(extracted, 0, 0);

    for (const item of result.items) {
      expect(Number.isInteger(item.quantity)).toBe(true);
      expect(item.quantity).toBeGreaterThanOrEqual(1);
    }
  });
});
