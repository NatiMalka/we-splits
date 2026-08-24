import { useCountUp } from '../../hooks/useCountUp';
import { formatCurrency } from '../../lib/format';
import { Button } from '../ui/Button';

interface ReviewSummaryBarProps {
  subtotal: number;
  tipAmount: number;
  total: number;
  canSubmit: boolean;
  onSubmit: () => void;
}

export function ReviewSummaryBar({ subtotal, tipAmount, total, canSubmit, onSubmit }: ReviewSummaryBarProps) {
  const animatedTotal = useCountUp(total, 0.3);

  return (
    <div className="glass-card-solid sticky bottom-0 mt-4 flex flex-col gap-3 px-5 py-4">
      <div className="flex items-center justify-between text-sm text-brand-sand/60">
        <span>ביניים {formatCurrency(subtotal)}</span>
        <span>טיפ {formatCurrency(tipAmount)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-brand-sand">{formatCurrency(animatedTotal)}</span>
        <div className="w-40">
          <Button onClick={onSubmit} disabled={!canSubmit} fullWidth>
            צור חדר
          </Button>
        </div>
      </div>
    </div>
  );
}
