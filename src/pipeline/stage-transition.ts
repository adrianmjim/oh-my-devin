import type { PipelineStage } from '../handoff/pipeline-stage';
import type { TeamDefinition } from '../team/team-definition';
import type { TeamTransition } from '../team/team-transition';

export function stageTransition(
  team: TeamDefinition,
  stage: PipelineStage,
): TeamTransition | null {
  return (
    team.workflow.find(
      (transition: TeamTransition): boolean => transition.from === stage,
    ) ?? null
  );
}
