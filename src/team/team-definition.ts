import type { TeamMember } from './team-member';
import type { TeamTransition } from './team-transition';

export interface TeamDefinition {
  readonly name: string;
  readonly members: readonly TeamMember[];
  readonly workflow: readonly TeamTransition[];
}
