import { useState } from 'react';
import { motion } from 'motion/react';

const PRESETS = [10, 12, 15];

interface TipPercentageSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function TipPercentageSelector({ value, onChange }: TipPercentageSelectorProps) {
  const [customMode, setCustomMode] = useState(!PRESETS.includes(value));

  return (
    <div className="flex items-center gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => {
            setCustomMode(false);
            onChange(preset);
          }}
          className="relative rounded-full px-4 py-2 text-sm font-semibold text-brand-sand"
        >
          {!customMode && value === preset && (
            <motion.div
              layoutId="tip-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-l from-brand-amber-500 to-brand-coral-500"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative ${!customMode && value === preset ? 'text-brand-charcoal' : 'text-brand-sand/70'}`}>
            {preset}%
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => setCustomMode(true)}
        className="relative rounded-full px-4 py-2 text-sm font-semibold"
      >
        {customMode && (
          <motion.div
            layoutId="tip-pill"
            className="absolute inset-0 rounded-full bg-gradient-to-l from-brand-amber-500 to-brand-coral-500"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className={`relative ${customMode ? 'text-brand-charcoal' : 'text-brand-sand/70'}`}>אחר</span>
      </button>
      {customMode && (
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
          className="w-16 rounded-full border border-white/10 bg-white/5 py-1.5 text-center text-sm text-brand-sand outline-none"
        />
      )}
    </div>
  );
}
