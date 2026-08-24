import type { BillData } from '../types';
import { mockReceipts, type MockReceiptKey } from './receipts';

export interface MockAnalyzeResult {
  billData: BillData;
  includeServiceInSplitDefault: boolean;
}

/** Simulates the Gemini Vision "analyze receipt" call with a randomized delay. */
export function mockAnalyzeReceipt(key?: MockReceiptKey): Promise<MockAnalyzeResult> {
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

  const delay = 1500 + Math.random() * 700;
  return new Promise((resolve) => {
    setTimeout(() => resolve({ billData, includeServiceInSplitDefault }), delay);
  });
}
