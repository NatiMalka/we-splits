import type { BillItem } from '../../types';

/** One row as the model returned it, before we trust any of it. */
export interface ExtractedItem {
  name: string;
  quantity: number;
  /** Price for a single unit — the `מחיר` column. */
  unitPrice: number;
  /** Price for the whole row — the `סך הכל` column. Absent if unreadable. */
  lineTotal?: number;
}

/** How close two money figures must be to count as the same. */
const MONEY_EPSILON = 0.5;

export interface ReconcileResult {
  items: BillItem[];
  /** True when the repaired items add up to the total printed on the receipt. */
  matchesPrintedTotal: boolean;
  /** Rows whose two price columns disagreed and were repaired. */
  repairedItemNames: string[];
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Turns the model's reading of a receipt into per-unit prices we can trust.
 *
 * Israeli receipts print both a unit price (`מחיר`) and a row total (`סך הכל`),
 * and the model sometimes reads the row total into the unit-price field. On rows
 * with quantity 1 that's harmless — the two are equal — but on `כמות: 2` it
 * doubles the row, which is how a ₪369 bill became ₪489.
 *
 * Rather than trusting either column, this uses the receipt's own redundancy:
 * both readings are totalled and checked against the printed grand total, and
 * whichever reconciles wins. That makes the repair deterministic and independent
 * of how the model happened to read the image this time.
 */
export function reconcileItems(
  extracted: ExtractedItem[],
  serviceFee: number,
  printedTotal: number,
): ReconcileResult {
  const toBillItems = (lineTotals: number[]): BillItem[] =>
    extracted.map((item, i) => {
      const quantity = Math.max(1, Math.round(item.quantity) || 1);
      return {
        id: crypto.randomUUID(),
        name: item.name,
        quantity,
        // The engine multiplies price by quantity, so store the per-unit figure.
        price: lineTotals[i] / quantity,
      };
    });

  const quantities = extracted.map((item) => Math.max(1, Math.round(item.quantity) || 1));

  // Reading A: the unit-price column is genuinely per unit.
  const asUnitPrice = extracted.map((item, i) => item.unitPrice * quantities[i]);

  // Reading B: prefer the row-total column wherever the model gave us one.
  const asLineTotal = extracted.map((item, i) =>
    item.lineTotal !== undefined && item.lineTotal > 0 ? item.lineTotal : asUnitPrice[i],
  );

  const totalA = sum(asUnitPrice) + serviceFee;
  const totalB = sum(asLineTotal) + serviceFee;

  const aMatches = printedTotal > 0 && Math.abs(totalA - printedTotal) <= MONEY_EPSILON;
  const bMatches = printedTotal > 0 && Math.abs(totalB - printedTotal) <= MONEY_EPSILON;

  // Prefer A when both reconcile — they only differ if a column disagreed, and A
  // needs no repair at all.
  const chosen = aMatches ? asUnitPrice : bMatches ? asLineTotal : asUnitPrice;

  const repairedItemNames = extracted
    .filter((_item, i) => Math.abs(chosen[i] - asUnitPrice[i]) > MONEY_EPSILON)
    .map((item) => item.name);

  return {
    items: toBillItems(chosen),
    matchesPrintedTotal: aMatches || bMatches,
    repairedItemNames,
  };
}
