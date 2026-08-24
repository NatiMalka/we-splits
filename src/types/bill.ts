export interface BillItem {
  id: string;
  name: string;
  /** Number of identical physical units on this line. */
  quantity: number;
  /** Price per single unit — the line total is price * quantity. */
  price: number;
}

export interface BillData {
  restaurantName: string | null;
  currency: 'ILS';
  /** Absolute ₪ amount already charged as service fee on the receipt, 0 if none. */
  serviceFee: number;
  /** Printed grand total, used only for reconciliation checks. */
  rawTotal: number;
  items: BillItem[];
}
