import { AnimatePresence } from 'motion/react';
import type { BillItem } from '../../types';
import { ItemEditableRow } from './ItemEditableRow';

interface ItemListProps {
  items: BillItem[];
  onChange: (item: BillItem) => void;
  onRemove: (itemId: string) => void;
}

export function ItemList({ items, onChange, onRemove }: ItemListProps) {
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
