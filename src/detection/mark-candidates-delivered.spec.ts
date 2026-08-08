import { describe, expect, it } from 'vitest';
import { markCandidatesDelivered } from './mark-candidates-delivered';
import type { StagedCandidate } from './staged-candidate';

function candidate(
  principle: string,
  deliveredAt: number | null = null,
): StagedCandidate {
  return {
    principle,
    confirmingCommand: `omd memory remember "${principle}"`,
    score: 0.8,
    expiresAt: 5_000,
    deliveredAt,
  };
}

describe('markCandidatesDelivered', () => {
  it('marks exactly the candidates that were delivered', () => {
    const staged: readonly StagedCandidate[] = [
      candidate('delivered now'),
      candidate('still waiting'),
    ];

    const marked: readonly StagedCandidate[] = markCandidatesDelivered(
      staged,
      ['delivered now'],
      1_500,
    );

    expect(marked[0]?.deliveredAt).toBe(1_500);
    expect(marked[1]?.deliveredAt).toBeNull();
  });

  it('leaves an earlier delivery stamp standing', () => {
    const marked: readonly StagedCandidate[] = markCandidatesDelivered(
      [candidate('sent', 900)],
      ['sent'],
      1_500,
    );

    expect(marked[0]?.deliveredAt).toBe(900);
  });
});
