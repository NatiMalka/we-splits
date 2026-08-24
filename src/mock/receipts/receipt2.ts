import type { BillData } from '../../types';

const items = [
  { name: 'בורגר קלאסי', quantity: 2, price: 68 },
  { name: 'בורגר טבעוני', quantity: 1, price: 72 },
  { name: "צ'יפס בטטה", quantity: 1, price: 32 },
  { name: 'סלט קיסר', quantity: 1, price: 54 },
  { name: 'שייק שוקולד', quantity: 2, price: 34 },
  { name: 'בירה מהחבית', quantity: 3, price: 28 },
  { name: 'מים בטעמים', quantity: 2, price: 16 },
];

const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
const serviceFee = Math.round(subtotal * 0.1);

export const receipt2: Omit<BillData, 'items'> & {
  items: Omit<BillData['items'][number], 'id'>[];
  includeServiceInSplitDefault: boolean;
} = {
  restaurantName: 'קפה בורגר בר תל אביב',
  currency: 'ILS',
  serviceFee,
  rawTotal: subtotal + serviceFee,
  items,
  includeServiceInSplitDefault: true,
};
