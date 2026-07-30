import type { RoleWriteScopes } from '../catalog/role-write-scopes';
import { TeamDefinitionError } from './team-definition-error';
import type { TeamMember } from './team-member';

export function requireSingleWorktreeMember(
  members: readonly TeamMember[],
  roleScopes: RoleWriteScopes,
): void {
  let holder: string | null = null;
  members.forEach((member: TeamMember, index: number): void => {
    if (roleScopes.get(member.role) === 'worktree') {
      if (holder !== null) {
        throw new TeamDefinitionError(
          `members[${index}] "${member.role}" declares the "worktree" write scope, but "${holder}" already holds it: a team pipeline captures a single diff from one worktree-scoped producer`,
        );
      }
      holder = member.role;
    }
  });
}
