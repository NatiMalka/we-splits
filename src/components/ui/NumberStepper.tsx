import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function NumberStepper({ value, min = 0, max = Infinity, step = 1, onChange }: NumberStepperProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-2 py-1.5 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, Number((value - step).toFixed(2))))}
        disabled={value <= min}
        aria-label="הפחת"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-brand-sand disabled:opacity-30"
      >
        <Minus size={16} />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-semibold text-brand-sand tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, Number((value + step).toFixed(2))))}
        disabled={value >= max}
        aria-label="הוסף"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-brand-sand disabled:opacity-30"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
