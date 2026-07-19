import type { TeamDefinition } from '../team/team-definition';
import type { DecisionRecord } from './decision-record';
import type { PipelineLauncher } from './pipeline-launcher';

export interface BridgeInput {
  readonly record: DecisionRecord;
  readonly team: TeamDefinition | null;
  readonly humanSigned: boolean;
  readonly launch: PipelineLauncher;
}
