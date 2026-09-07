import { Skeleton } from './Skeleton';

/**
 * Shaped to match the real content that replaces it — a header block plus rows
 * the size of a MenuItemCard — so the swap reads as the page filling in rather
 * than one thing being replaced by another.
 *
 * Replaces the bare, text-free <Spinner/> that every room screen used to show
 * (plan item 3.14). A spinner says "something is happening"; this says "a list
 * of items is about to be here", which is the more useful message.
 */
export function RoomLoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-1 flex-col gap-3">
      <span className="sr-only">טוען את החשבון...</span>

      <div className="glass-card flex flex-col gap-3 p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="mt-1 flex flex-col gap-2.5">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {/* Varied widths — rows of identical length look like a broken
                  table rather than text that hasn't arrived. */}
              <Skeleton className={`h-3.5 ${['w-32', 'w-40', 'w-24', 'w-36', 'w-28'][i % 5]}`} />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
