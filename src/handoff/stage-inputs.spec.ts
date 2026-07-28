import { describe, expect, it } from 'vitest';
import { baseStageEntry } from './base-stage-entry';
import type { HandoffArtifactName } from './handoff-artifact-name';
import { INCOMING_ARTIFACTS } from './incoming-artifacts';
import type { PipelineStage } from './pipeline-stage';
import { reworkStageEntry } from './rework-stage-entry';
import { stageInputs } from './stage-inputs';

describe('stageInputs', () => {
  it('names the designated inputs of a first entry', () => {
    expect(stageInputs(baseStageEntry('reviewer'))).toEqual([
      'requirements',
      'diff',
      'evidence.json',
    ]);
  });

  it('gives an approving entry the base incoming set, for every stage', () => {
    expect(stageInputs(baseStageEntry('architect'))).toEqual(
      INCOMING_ARTIFACTS.architect,
    );
    expect(stageInputs(baseStageEntry('executor'))).toEqual(
      INCOMING_ARTIFACTS.executor,
    );
    expect(stageInputs(baseStageEntry('reviewer'))).toEqual(
      INCOMING_ARTIFACTS.reviewer,
    );
  });

  it('extends the base set over the designated rework edge', () => {
    expect(stageInputs(reworkStageEntry('executor', 'reviewer'))).toEqual([
      'requirements',
      'architecture.json',
      'review.json',
      'diff',
    ]);
  });

  it('leaves an undesignated rework edge at the base set', () => {
    expect(stageInputs(reworkStageEntry('executor', 'architect'))).toEqual(
      INCOMING_ARTIFACTS.executor,
    );
  });

  it('repeats no name over any entry a declaration can express', () => {
    const stages: readonly PipelineStage[] = [
      'architect',
      'executor',
      'reviewer',
    ];
    for (const stage of stages) {
      const base: readonly HandoffArtifactName[] = stageInputs(
        baseStageEntry(stage),
      );
      expect(new Set(base).size).toBe(base.length);
      for (const rejectedBy of stages) {
        const names: readonly HandoffArtifactName[] = stageInputs(
          reworkStageEntry(stage, rejectedBy),
        );
        expect(new Set(names).size).toBe(names.length);
      }
    }
  });
});
