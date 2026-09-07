import type { AnalyzeStage } from '../../lib/gemini/analyzeReceipt';

/**
 * How long a scan can run before we stop implying it's going normally. Chosen
 * from the real shape of the request: one round trip is typically 3-8s, so past
 * ~12s something is genuinely slow and pretending otherwise is what makes people
 * force-quit the app.
 */
export const SLOW_SCAN_MS = 12_000;

export type StageProgress =
  | { mode: 'determinate'; value: number }
  | { mode: 'indeterminate' };

export interface StageCopy {
  title: string;
  /** Second line. `null` when there is nothing honest to add. */
  detail: string | null;
  progress: StageProgress;
}

/**
 * Maps a real request stage to what the user is told.
 *
 * The rule this encodes: **never show a percentage we can't justify.** While the
 * request is in flight we have no idea how long it will take, so the bar goes
 * indeterminate rather than creeping to a number and freezing there. Only the
 * two ends — the image being prepared, and the response being parsed — are
 * genuinely determinate.
 */
export function describeStage(stage: AnalyzeStage, elapsedMs: number): StageCopy {
  switch (stage.kind) {
    case 'preparing':
      return {
        title: 'מכינים את התמונה...',
        detail: null,
        progress: { mode: 'determinate', value: 10 },
      };

    case 'reading':
      return {
        title: 'קורא את החשבונית...',
        detail:
          elapsedMs >= SLOW_SCAN_MS
            ? 'לוקח יותר מהרגיל — עוד רגע'
            : 'זה לוקח כמה שניות',
        progress: { mode: 'indeterminate' },
      };

    case 'retrying':
      return {
        title: 'השירות עמוס כרגע',
        detail: `מנסים שוב (${stage.attempt} מתוך ${stage.maxAttempts})`,
        progress: { mode: 'indeterminate' },
      };

    case 'parsing':
      return {
        title: 'מסדר את הפריטים...',
        detail: null,
        progress: { mode: 'determinate', value: 100 },
      };
  }
}
