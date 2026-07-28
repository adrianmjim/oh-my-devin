import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from './handoff-artifact-name';
import { REWORK_ARTIFACTS } from './rework-artifacts';
import type { ReworkDesignation } from './rework-designation';

describe('REWORK_ARTIFACTS', () => {
  it('designates exactly the reviewer-to-executor pair', () => {
    expect(REWORK_ARTIFACTS).toEqual([
      {
        rejectedBy: 'reviewer',
        reentered: 'executor',
        artifacts: ['review.json', 'diff'],
      },
    ]);
  });

  it('designates only artifacts the rejecting stage has already produced', () => {
    const producedByReviewerOrEarlier: readonly HandoffArtifactName[] = [
      'requirements',
      'architecture.json',
      'diff',
      'evidence.json',
      'review.json',
    ];
    for (const designation of REWORK_ARTIFACTS) {
      for (const artifact of designation.artifacts) {
        expect(producedByReviewerOrEarlier).toContain(artifact);
      }
    }
  });

  it('carries no pair twice', () => {
    const pairs: string[] = REWORK_ARTIFACTS.map(
      (designation: ReworkDesignation): string =>
        `${designation.rejectedBy}->${designation.reentered}`,
    );
    expect(new Set(pairs).size).toBe(pairs.length);
  });
});
