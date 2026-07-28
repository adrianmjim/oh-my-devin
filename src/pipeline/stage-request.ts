import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { StageEntry } from '../handoff/stage-entry';

export interface StageRequest extends StageEntry {
  readonly inputs: ReadonlyMap<HandoffArtifactName, string>;
}
