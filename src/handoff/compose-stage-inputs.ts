import type { ArtifactStore } from './artifact-store';
import type { HandoffArtifactName } from './handoff-artifact-name';
import { HandoffError } from './handoff-error';
import type { PipelineStage } from './pipeline-stage';

const INCOMING: Record<PipelineStage, readonly HandoffArtifactName[]> = {
  architect: ['requirements'],
  executor: ['requirements', 'architecture.json'],
  reviewer: ['requirements', 'diff', 'evidence.json'],
};

export function stageInputs(
  stage: PipelineStage,
): readonly HandoffArtifactName[] {
  return INCOMING[stage];
}

export function composeStageInputs(
  stage: PipelineStage,
  store: ArtifactStore,
): ReadonlyMap<HandoffArtifactName, string> {
  const entries: [HandoffArtifactName, string][] = [];
  for (const name of INCOMING[stage]) {
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
