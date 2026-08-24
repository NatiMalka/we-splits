import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { BillData, BillItem } from '../types';

interface DraftState {
  billData: BillData | null;
  creatorName: string;
  tipPercentage: number;
  includeServiceInSplit: boolean;
}

type DraftAction =
  | { type: 'SET_BILL_DATA'; billData: BillData; includeServiceInSplit: boolean }
  | { type: 'SET_CREATOR_NAME'; name: string }
  | { type: 'SET_TIP_PERCENTAGE'; tip: number }
  | { type: 'SET_INCLUDE_SERVICE'; include: boolean }
  | { type: 'UPDATE_ITEM'; item: BillItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'ADD_ITEM'; item: BillItem }
  | { type: 'RESET' };

export const DEFAULT_TIP_PERCENTAGE = 12;

/**
 * Israeli receipts often already carry a דמי שירות line. Tipping on top of that
 * charges the table twice, so a bill that already includes service starts at 0%
 * and a tip is added only if someone actually means to.
 */
export function defaultTipFor(billData: BillData): number {
  return billData.serviceFee > 0 ? 0 : DEFAULT_TIP_PERCENTAGE;
}

const initialState: DraftState = {
  billData: null,
  creatorName: '',
  tipPercentage: DEFAULT_TIP_PERCENTAGE,
  includeServiceInSplit: false,
};

function reducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'SET_BILL_DATA':
      return {
        ...state,
        billData: action.billData,
        tipPercentage: defaultTipFor(action.billData),
        includeServiceInSplit: action.includeServiceInSplit,
      };
    case 'SET_CREATOR_NAME':
      return { ...state, creatorName: action.name };
    case 'SET_TIP_PERCENTAGE':
      return { ...state, tipPercentage: action.tip };
    case 'SET_INCLUDE_SERVICE':
      return { ...state, includeServiceInSplit: action.include };
    case 'UPDATE_ITEM':
      if (!state.billData) return state;
      return {
        ...state,
        billData: {
          ...state.billData,
          items: state.billData.items.map((item) => (item.id === action.item.id ? action.item : item)),
        },
      };
    case 'REMOVE_ITEM':
      if (!state.billData) return state;
      return {
        ...state,
        billData: { ...state.billData, items: state.billData.items.filter((item) => item.id !== action.itemId) },
      };
    case 'ADD_ITEM':
      if (!state.billData) return state;
      return { ...state, billData: { ...state.billData, items: [...state.billData.items, action.item] } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface DraftBillContextValue extends DraftState {
  setBillData: (billData: BillData, includeServiceInSplit: boolean) => void;
  setCreatorName: (name: string) => void;
  setTipPercentage: (tip: number) => void;
  setIncludeServiceInSplit: (include: boolean) => void;
  updateItem: (item: BillItem) => void;
  removeItem: (itemId: string) => void;
  addItem: (item: BillItem) => void;
  reset: () => void;
}

const DraftBillContext = createContext<DraftBillContextValue | null>(null);

export function DraftBillProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<DraftBillContextValue>(
    () => ({
      ...state,
      setBillData: (billData, includeServiceInSplit) =>
        dispatch({ type: 'SET_BILL_DATA', billData, includeServiceInSplit }),
      setCreatorName: (name) => dispatch({ type: 'SET_CREATOR_NAME', name }),
      setTipPercentage: (tip) => dispatch({ type: 'SET_TIP_PERCENTAGE', tip }),
      setIncludeServiceInSplit: (include) => dispatch({ type: 'SET_INCLUDE_SERVICE', include }),
      updateItem: (item) => dispatch({ type: 'UPDATE_ITEM', item }),
      removeItem: (itemId) => dispatch({ type: 'REMOVE_ITEM', itemId }),
      addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  );

  return <DraftBillContext.Provider value={value}>{children}</DraftBillContext.Provider>;
}

export function useDraftBill(): DraftBillContextValue {
  const context = useContext(DraftBillContext);
  if (!context) throw new Error('useDraftBill must be used within a DraftBillProvider');
  return context;
}
