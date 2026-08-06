import { describe, expect, it } from 'vitest';
import type { PairingCandidate } from './pairing-candidate';
import { planCandidates } from './plan-candidates';

describe('planCandidates', () => {
  it('offers the approach and every step as pairing candidates', () => {
    const candidates: readonly PairingCandidate[] = planCandidates({
      approach: 'Rename behind a migration',
      steps: [{ description: 'Add the migration', files: ['db/0002.sql'] }],
    });

    expect(candidates).toEqual([
      { id: 'approach', text: 'Rename behind a migration' },
      { id: 'step-0', text: 'Add the migration db/0002.sql' },
    ]);
  });

  it('keeps a step with no files pairable on its description alone', () => {
    expect(
      planCandidates({
        approach: 'a',
        steps: [{ description: 'Backfill', files: [] }],
      })[1],
    ).toEqual({ id: 'step-0', text: 'Backfill ' });
  });
});
