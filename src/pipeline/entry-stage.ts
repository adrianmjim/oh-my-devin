import type { PipelineStage } from '../handoff/pipeline-stage';
import { isPipelineStage } from '../handoff/pipeline-stage';
import type { TeamDefinition } from '../team/team-definition';
import { PipelineError } from './pipeline-error';

export function entryStage(team: TeamDefinition): PipelineStage {
  const first: string | undefined = team.members[0]?.role;
  if (first === undefined || !isPipelineStage(first)) {
    throw new PipelineError(
      `team "${team.name}" does not start with an MVP-1 pipeline stage`,
    );
  }
  return first;
}
