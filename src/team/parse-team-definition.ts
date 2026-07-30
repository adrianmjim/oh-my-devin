import { parse as parseYaml } from 'yaml';
import type { RoleWriteScopes } from '../catalog/role-write-scopes';
import { parseMembers } from './parse-members';
import { parseWorkflow } from './parse-workflow';
import { requireSingleWorktreeMember } from './require-single-worktree-member';
import { requireTeamString } from './require-team-string';
import type { TeamDefinition } from './team-definition';
import { TeamDefinitionError } from './team-definition-error';
import type { TeamMember } from './team-member';
import type { TeamTransition } from './team-transition';
import { TERMINAL_WORKFLOW_NODE } from './terminal-workflow-node';

export function parseTeamDefinition(
  yaml: string,
  roleScopes: RoleWriteScopes,
): TeamDefinition {
  const parsed: unknown = parseYaml(yaml);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new TeamDefinitionError('team declaration must be a mapping');
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;

  const name: string = requireTeamString(fields['name'], 'name');
  const members: readonly TeamMember[] = parseMembers(fields['members'], [
    ...roleScopes.keys(),
  ]);
  requireSingleWorktreeMember(members, roleScopes);
  const memberRoles: ReadonlySet<string> = new Set(
    members.map((member: TeamMember): string => member.role),
  );
  const validNodes: ReadonlySet<string> = new Set([
    ...memberRoles,
    TERMINAL_WORKFLOW_NODE,
  ]);
  const workflow: readonly TeamTransition[] = parseWorkflow(
    fields['workflow'],
    memberRoles,
    validNodes,
  );

  return { name, members, workflow };
}
