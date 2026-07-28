import type { HandoffArtifactName } from './handoff-artifact-name';
import { INCOMING_ARTIFACTS } from './incoming-artifacts';
import { reworkArtifactsFor } from './rework-artifacts-for';
import type { StageEntry } from './stage-entry';

export function stageInputs(entry: StageEntry): readonly HandoffArtifactName[] {
  const names: HandoffArtifactName[] = [...INCOMING_ARTIFACTS[entry.stage]];
  for (const name of reworkArtifactsFor(entry)) {
    if (!names.includes(name)) {
      names.push(name);
    }
  }
  return names;
}
