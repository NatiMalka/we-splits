import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface PaidToggleButtonProps {
  paid: boolean;
  onToggle: (paid: boolean) => void;
}

interface SegmentProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  /** The "yes I paid" side gets the teal pill and the check. */
  positive?: boolean;
}

/**
 * Two explicit choices rather than one toggle.
 *
 * The single button this replaces was labelled with the *state* it was in —
 * "עדיין לא שילמתי" — which left it ambiguous whether tapping meant "this is
 * true of me" or "change me to this". That's the standard toggle problem, and
 * this is the worst screen in the app to have it on: the cost of guessing
 * wrong is telling four other people you've paid when you haven't.
 *
 * Both options are on screen at once now, the selected one is filled, and
 * tapping one is a statement rather than a flip.
 */
export function PaidToggleButton({ paid, onToggle }: PaidToggleButtonProps) {
  return (
    <div
      role="radiogroup"
      aria-label="סטטוס התשלום שלי"
      // Concentric: 16px outer radius minus the 4px of padding gives the
      // segments 12px, so the pill sits inside the track without looking pinched.
      className="flex w-full rounded-2xl border border-white/10 bg-white/6 p-1"
    >
      {/* Unpaid first: in RTL that puts it on the right, so the pair reads in
          the order people move through it. */}
      <Segment selected={!paid} onSelect={() => onToggle(false)} label="לא שילמתי" />
      <Segment selected={paid} onSelect={() => onToggle(true)} label="שילמתי" positive />
    </div>
  );
}

function Segment({ selected, onSelect, label, positive }: SegmentProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      // Re-picking the state you're already in would fire another Firestore
      // write that changes nothing.
      onClick={() => {
        if (!selected) onSelect();
      }}
      // No press scale here on purpose: the pill sliding under your thumb is
      // already the feedback, and a second motion on top of it reads as noise.
      className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition-colors ${
        selected ? 'text-brand-charcoal' : 'text-brand-sand/50'
      }`}
    >
      {selected && (
        <motion.div
          layoutId="paid-pill"
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className={`absolute inset-0 rounded-xl ${
            positive ? 'bg-brand-teal-300' : 'bg-brand-sand/85'
          }`}
        />
      )}
      {/* Above the pill, which is absolutely positioned over the whole segment. */}
      <span className="relative flex items-center gap-2">
        {positive && <Check size={18} />}
        {label}
      </span>
    </button>
  );
}
