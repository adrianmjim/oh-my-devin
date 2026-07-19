import type { TeamDefinition } from '../team/team-definition';
import type { PipelineGate } from './pipeline-gate';
import type { StageRunner } from './stage-runner';

export interface RunPipelineOptions {
  readonly team: TeamDefinition;
  readonly task: string;
  readonly runStage: StageRunner;
  readonly gate: PipelineGate;
  readonly requirements?: string;
}
