import { receipt1 } from './receipt1';
import { receipt2 } from './receipt2';

export const mockReceipts = {
  receipt1,
  receipt2,
} as const;

export type MockReceiptKey = keyof typeof mockReceipts;

export const mockReceiptLabels: Record<MockReceiptKey, string> = {
  receipt1: 'מסעדת בשרים',
  receipt2: 'בורגר בר',
};
