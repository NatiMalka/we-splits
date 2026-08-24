import { useMemo } from 'react';
import type { Room } from '../types';
import { computeBillClaimProgress, computeParticipantTotals } from '../lib/calc/splitEngine';

export function useCalculations(room: Room | null) {
  return useMemo(() => {
    if (!room) return { totals: [], progress: { claimedRatio: 0, perItem: [] } };
    return {
      totals: computeParticipantTotals(room),
      progress: computeBillClaimProgress(room),
    };
  }, [room]);
}
