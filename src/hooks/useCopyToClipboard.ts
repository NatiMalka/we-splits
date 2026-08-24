import { useCallback, useState } from 'react';

export function useCopyToClipboard(resetAfterMs = 1500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetAfterMs);
      } catch {
        // Clipboard API unavailable — silently no-op, the button just won't flip to "copied".
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
