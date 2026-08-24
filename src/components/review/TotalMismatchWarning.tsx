import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/format';

interface TotalMismatchWarningProps {
  /** Items + service, as parsed from the photo. */
  parsedTotal: number;
  /** The total actually printed on the receipt. */
  printedTotal: number;
}

export function TotalMismatchWarning({ parsedTotal, printedTotal }: TotalMismatchWarningProps) {
  const difference = parsedTotal - printedTotal;
  const tooHigh = difference > 0;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-brand-amber-500/30 bg-brand-amber-500/10 px-4 py-3">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-brand-amber-300" />
      <div className="text-sm leading-relaxed">
        <p className="font-semibold text-brand-amber-300">
          הסכומים לא מסתדרים — כדאי לבדוק
        </p>
        <p className="mt-1 text-brand-sand/70">
          הפריטים למעלה מסתכמים ב־{formatCurrency(parsedTotal)}, אבל בחשבונית כתוב{' '}
          {formatCurrency(printedTotal)} — {tooHigh ? 'יותר מדי' : 'חסר'}{' '}
          {formatCurrency(Math.abs(difference))}.
        </p>
        <p className="mt-1 text-xs text-brand-sand/50">
          כנראה שמחיר אחד נקרא לא נכון, או שפריט לא זוהה. השוו לחשבונית ותקנו למעלה.
        </p>
      </div>
    </div>
  );
}
