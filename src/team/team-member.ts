import type { TeamStrategy } from './team-strategy';

export interface TeamMember {
  readonly role: string;
  readonly count: number;
  readonly strategy: TeamStrategy | null;
}
