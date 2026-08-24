import { Plus } from 'lucide-react';

export function AddItemButton({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2.5 text-sm font-medium text-brand-sand/60 hover:text-brand-sand"
    >
      <Plus size={16} />
      הוסף מנה
    </button>
  );
}
