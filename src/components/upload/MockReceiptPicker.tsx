import { mockReceiptLabels, type MockReceiptKey } from '../../mock/receipts';

interface MockReceiptPickerProps {
  onPick: (key: MockReceiptKey) => void;
}

/** Dev-only shortcut so local UI work doesn't require a real receipt photo each time. */
export function MockReceiptPicker({ onPick }: MockReceiptPickerProps) {
  const keys = Object.keys(mockReceiptLabels) as MockReceiptKey[];

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-brand-sand/30">DEV: או נסה עם דוגמה</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onPick(key)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-brand-sand/60 transition-colors hover:border-brand-amber-400/40"
          >
            {mockReceiptLabels[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
