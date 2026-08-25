import { useCallback, useState } from 'react';

type ShareOutcome = 'shared' | 'copied' | 'failed';

interface SharePayload {
  text: string;
  url?: string;
  title?: string;
}

/**
 * Native share sheet where the browser has one (every mobile browser), clipboard
 * copy as the fallback on desktop. Callers need to know which happened so the
 * button can say "הועתק" rather than claiming it shared.
 */
export function useShare(resetAfterMs = 2000) {
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);

  const share = useCallback(
    async ({ text, url, title }: SharePayload): Promise<ShareOutcome> => {
      let result: ShareOutcome = 'failed';

      if (navigator.share) {
        try {
          await navigator.share({ text, url, title });
          result = 'shared';
        } catch (err) {
          // Dismissing the share sheet rejects with AbortError — that's a normal
          // user action, not a failure, so don't fall back to copying behind
          // their back or flash an error at them.
          if (err instanceof Error && err.name === 'AbortError') return 'shared';
        }
      }

      if (result === 'failed') {
        try {
          await navigator.clipboard.writeText(url ? `${text}\n${url}` : text);
          result = 'copied';
        } catch {
          result = 'failed';
        }
      }

      setOutcome(result);
      if (result !== 'failed') setTimeout(() => setOutcome(null), resetAfterMs);
      return result;
    },
    [resetAfterMs],
  );

  return { outcome, share };
}
