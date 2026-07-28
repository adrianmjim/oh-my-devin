import type { ArtifactStore } from './artifact-store';
import type { HandoffArtifactName } from './handoff-artifact-name';
import { HandoffError } from './handoff-error';
import type { StageEntry } from './stage-entry';
import { stageInputs } from './stage-inputs';

export function composeStageInputs(
  entry: StageEntry,
  store: ArtifactStore,
): ReadonlyMap<HandoffArtifactName, string> {
  const entries: [HandoffArtifactName, string][] = [];
  for (const name of stageInputs(entry)) {
    const content: string | undefined = store.get(name);
    if (content === undefined) {
      throw new HandoffError(
        `stage "${entry.stage}" is missing its designated input "${name}"`,
      );
    }
    entries.push([name, content]);
  }
  return new Map(entries);
}
