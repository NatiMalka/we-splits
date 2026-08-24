import type { BillData } from '../../types';

const items = [
  { name: 'סלט ירוק', quantity: 1, price: 38 },
  { name: 'חומוס עם בשר', quantity: 1, price: 52 },
  { name: 'אנטריקוט 300 גרם', quantity: 2, price: 129 },
  { name: 'פלטת בשרים לשניים', quantity: 1, price: 189 },
  { name: 'פירה טרוף', quantity: 2, price: 22 },
  { name: 'קולה', quantity: 3, price: 14 },
  { name: 'מים מינרלים', quantity: 2, price: 12 },
  { name: 'קינוח שוקולד לשיתוף', quantity: 1, price: 42 },
];

const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const receipt1: Omit<BillData, 'items'> & { items: Omit<BillData['items'][number], 'id'>[] } = {
  restaurantName: 'מסעדת הבשר של אבי',
  currency: 'ILS',
  serviceFee: 0,
  rawTotal: subtotal,
  items,
};
