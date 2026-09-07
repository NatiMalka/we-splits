import { AppShell } from '../components/layout/AppShell';
import { Skeleton } from '../components/ui/Skeleton';

/**
 * Shown only while a screen's own chunk is in flight — rare, because App warms
 * the next likely chunk on idle, so in practice this appears only on a cold load
 * of a directly-visited URL.
 *
 * Neutral on purpose: it has to sit under any of the nine screens without
 * implying the wrong one.
 */
export function RouteFallback() {
  return (
    <AppShell>
      <div role="status" aria-busy="true" className="flex flex-1 flex-col gap-4 pt-6">
        <span className="sr-only">טוען...</span>
        <Skeleton className="h-6 w-40 self-center" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </AppShell>
  );
}
