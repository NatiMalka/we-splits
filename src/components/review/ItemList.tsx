import { AnimatePresence } from 'motion/react';
import { ReceiptText } from 'lucide-react';
import type { BillItem } from '../../types';
import { ItemEditableRow } from './ItemEditableRow';
import { EmptyState } from '../ui/EmptyState';

interface ItemListProps {
  items: BillItem[];
  onChange: (item: BillItem) => void;
  onRemove: (itemId: string) => void;
}

export function ItemList({ items, onChange, onRemove }: ItemListProps) {
  // Reachable: delete every row. Previously the card just collapsed to a lone
  // "add item" button with no explanation.
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText size={22} />}
        title="אין פריטים בחשבונית"
        detail="הוסיפו פריט כדי להמשיך, או סרקו את החשבונית מחדש."
      />
    );
  }

  return (
    <div className="flex flex-col">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <ItemEditableRow key={item.id} item={item} onChange={onChange} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
