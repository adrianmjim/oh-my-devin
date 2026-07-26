import type { ArtifactStore } from './artifact-store';
import type { HandoffArtifactName } from './handoff-artifact-name';
import { HandoffError } from './handoff-error';
import { INCOMING_ARTIFACTS } from './incoming-artifacts';
import type { PipelineStage } from './pipeline-stage';

export function composeStageInputs(
  stage: PipelineStage,
  store: ArtifactStore,
): ReadonlyMap<HandoffArtifactName, string> {
  const entries: [HandoffArtifactName, string][] = [];
  for (const name of INCOMING_ARTIFACTS[stage]) {
    const content: string | undefined = store.get(name);
    if (content === undefined) {
      throw new HandoffError(
        `stage "${stage}" is missing its designated input "${name}"`,
      );
    }
    entries.push([name, content]);
  }
  return new Map(entries);
}
