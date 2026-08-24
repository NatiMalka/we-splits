import { ProgressBar } from '../ui/ProgressBar';

interface MenuScreenHeaderProps {
  restaurantName: string | null;
  claimedRatio: number;
}

export function MenuScreenHeader({ restaurantName, claimedRatio }: MenuScreenHeaderProps) {
  return (
    <div className="flex flex-col gap-2 pb-2">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="min-w-0 truncate text-lg font-bold text-brand-sand">{restaurantName ?? 'החשבונית'}</h1>
        <span className="shrink-0 text-sm font-medium text-brand-sand/60">{Math.round(claimedRatio * 100)}% שויך</span>
      </div>
      <ProgressBar ratio={claimedRatio} />
    </div>
  );
}
