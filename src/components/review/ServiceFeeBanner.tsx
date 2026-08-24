import { formatCurrency } from '../../lib/format';

interface ServiceFeeBannerProps {
  serviceFee: number;
  includeInSplit: boolean;
  onToggle: (include: boolean) => void;
}

export function ServiceFeeBanner({ serviceFee, includeInSplit, onToggle }: ServiceFeeBannerProps) {
  if (serviceFee <= 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-teal-500/25 bg-brand-teal-500/10 px-4 py-3">
      <div className="text-sm text-brand-sand/80">
        זוהה דמי שירות של <span className="font-semibold text-brand-sand">{formatCurrency(serviceFee)}</span> בחשבונית
      </div>
      <button
        type="button"
        onClick={() => onToggle(!includeInSplit)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          includeInSplit ? 'bg-brand-teal-500 text-brand-charcoal' : 'bg-white/10 text-brand-sand/60'
        }`}
      >
        {includeInSplit ? 'נכלל בחלוקה' : 'לא נכלל'}
      </button>
    </div>
  );
}
