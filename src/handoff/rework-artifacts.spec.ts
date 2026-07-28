import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from './handoff-artifact-name';
import { INCOMING_ARTIFACTS } from './incoming-artifacts';
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

  it('designates nothing the re-entered stage already receives at its base', () => {
    for (const designation of REWORK_ARTIFACTS) {
      const base: readonly HandoffArtifactName[] =
        INCOMING_ARTIFACTS[designation.reentered];
      for (const artifact of designation.artifacts) {
        expect(base, `${designation.reentered} base set`).not.toContain(
          artifact,
        );
      }
    }
  });

  it('repeats no artifact within a single designation', () => {
    for (const designation of REWORK_ARTIFACTS) {
      expect(new Set(designation.artifacts).size).toBe(
        designation.artifacts.length,
      );
    }
  });
});
