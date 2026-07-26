import type { TeamDefinition } from '../team/team-definition';

export interface LaunchRequest {
  readonly team: TeamDefinition;
  readonly question: string;
  readonly proposal: string;
}
