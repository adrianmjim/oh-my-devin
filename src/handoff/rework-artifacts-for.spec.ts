import { describe, expect, it } from 'vitest';
import { baseStageEntry } from './base-stage-entry';
import type { PipelineStage } from './pipeline-stage';
import { reworkArtifactsFor } from './rework-artifacts-for';
import { reworkStageEntry } from './rework-stage-entry';

const STAGES: readonly PipelineStage[] = ['architect', 'executor', 'reviewer'];

describe('reworkArtifactsFor', () => {
  it('designates the findings and the rejected diff for reviewer to executor', () => {
    expect(
      reworkArtifactsFor(reworkStageEntry('executor', 'reviewer')),
    ).toEqual(['review.json', 'diff']);
  });

  it('designates nothing for every other ordered stage pair', () => {
    for (const rejectedBy of STAGES) {
      for (const reentered of STAGES) {
        const designated: boolean =
          rejectedBy === 'reviewer' && reentered === 'executor';
        if (!designated) {
          expect(
            reworkArtifactsFor(reworkStageEntry(reentered, rejectedBy)),
          ).toEqual([]);
        }
      }
    }
  });

  it('designates nothing for an approving entry, whatever the stage', () => {
    for (const stage of STAGES) {
      expect(reworkArtifactsFor(baseStageEntry(stage))).toEqual([]);
    }
  });
});
