import type { BillData } from '../types';
import type { AnalyzeStage } from '../lib/gemini/analyzeReceipt';
import { mockReceipts, type MockReceiptKey } from './receipts';

export interface MockAnalyzeResult {
  billData: BillData;
  includeServiceInSplitDefault: boolean;
}

export interface MockAnalyzeOptions {
  onStage?: (stage: AnalyzeStage) => void;
}

/**
 * Simulates the Gemini Vision "analyze receipt" call with a randomized delay.
 *
 * Emits the same stages as the real call so the dev flow drives the same overlay
 * code path — the previous overlay was tuned against this mock's ~2s delay and
 * nobody noticed it broke against the real 10-25s one.
 */
export function mockAnalyzeReceipt(
  key?: MockReceiptKey,
  { onStage }: MockAnalyzeOptions = {},
): Promise<MockAnalyzeResult> {
  const chosenKey: MockReceiptKey = key ?? (Math.random() < 0.5 ? 'receipt1' : 'receipt2');
  const source = mockReceipts[chosenKey];
  const includeServiceInSplitDefault = 'includeServiceInSplitDefault' in source
    ? Boolean(source.includeServiceInSplitDefault)
    : source.serviceFee > 0;

  const billData: BillData = {
    restaurantName: source.restaurantName,
    currency: source.currency,
    serviceFee: source.serviceFee,
    rawTotal: source.rawTotal,
    items: source.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
  };

  onStage?.({ kind: 'preparing' });
  const delay = 1500 + Math.random() * 700;
  return new Promise((resolve) => {
    setTimeout(() => onStage?.({ kind: 'reading', attempt: 1, maxAttempts: 3 }), 150);
    setTimeout(() => {
      onStage?.({ kind: 'parsing' });
      resolve({ billData, includeServiceInSplitDefault });
    }, delay);
  });
}
