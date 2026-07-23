import type { Clock } from '../budget/clock';
import type { RunId } from '../observability/run-id';
import type { RunObserver } from '../observability/run-observer';
import type { TeamDefinition } from '../team/team-definition';
import type { PipelineGate } from './pipeline-gate';
import type { StageRunner } from './stage-runner';

export interface RunPipelineOptions {
  readonly team: TeamDefinition;
  readonly task: string;
  readonly runStage: StageRunner;
  readonly gate: PipelineGate;
  readonly requirements?: string;
  readonly runId?: RunId;
  readonly observer?: RunObserver;
  readonly clock?: Clock;
}
