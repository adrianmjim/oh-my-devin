import type { HandoffArtifactName } from './handoff-artifact-name';
import { REWORK_ARTIFACTS } from './rework-artifacts';
import type { ReworkDesignation } from './rework-designation';
import type { StageEntry } from './stage-entry';

export function reworkArtifactsFor(
  entry: StageEntry,
): readonly HandoffArtifactName[] {
  const designation: ReworkDesignation | undefined = REWORK_ARTIFACTS.find(
    (candidate: ReworkDesignation): boolean =>
      candidate.rejectedBy === entry.reworkFrom &&
      candidate.reentered === entry.stage,
  );
  return designation?.artifacts ?? [];
}
