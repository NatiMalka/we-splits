import { describe, expect, it } from 'vitest';
import { describeStage, SLOW_SCAN_MS } from './analyzeStageCopy';

describe('describeStage', () => {
  it('is determinate only at the two ends we actually know', () => {
    expect(describeStage({ kind: 'preparing' }, 0).progress).toEqual({
      mode: 'determinate',
      value: 10,
    });
    expect(describeStage({ kind: 'parsing' }, 9999).progress).toEqual({
      mode: 'determinate',
      value: 100,
    });
  });

  it('never claims a percentage while waiting on the network', () => {
    // The old overlay's whole bug: a bar creeping to 92% and freezing there for
    // twenty seconds. An in-flight request has no honest percentage.
    const reading = describeStage({ kind: 'reading', attempt: 1, maxAttempts: 3 }, 3000);
    expect(reading.progress).toEqual({ mode: 'indeterminate' });

    const retrying = describeStage(
      { kind: 'retrying', attempt: 2, maxAttempts: 3, waitMs: 1000 },
      5000,
    );
    expect(retrying.progress).toEqual({ mode: 'indeterminate' });
  });

  it('admits when a scan is taking longer than normal', () => {
    const stage = { kind: 'reading', attempt: 1, maxAttempts: 3 } as const;

    expect(describeStage(stage, SLOW_SCAN_MS - 1).detail).toBe('זה לוקח כמה שניות');
    expect(describeStage(stage, SLOW_SCAN_MS).detail).toBe('לוקח יותר מהרגיל — עוד רגע');
    expect(describeStage(stage, 30_000).detail).toBe('לוקח יותר מהרגיל — עוד רגע');
  });

  it('tells the user a retry is happening, and which one', () => {
    // Previously a 503 retry was a silent 1-2s stall mid-wait.
    const copy = describeStage(
      { kind: 'retrying', attempt: 2, maxAttempts: 3, waitMs: 1000 },
      4000,
    );
    expect(copy.title).toBe('השירות עמוס כרגע');
    expect(copy.detail).toBe('מנסים שוב (2 מתוך 3)');

    const last = describeStage(
      { kind: 'retrying', attempt: 3, maxAttempts: 3, waitMs: 2000 },
      8000,
    );
    expect(last.detail).toBe('מנסים שוב (3 מתוך 3)');
  });

  it('always produces a non-empty title for every stage', () => {
    const stages = [
      { kind: 'preparing' },
      { kind: 'reading', attempt: 1, maxAttempts: 3 },
      { kind: 'retrying', attempt: 2, maxAttempts: 3, waitMs: 1000 },
      { kind: 'parsing' },
    ] as const;

    for (const stage of stages) {
      expect(describeStage(stage, 0).title.length).toBeGreaterThan(0);
    }
  });
});
