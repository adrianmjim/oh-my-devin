import type { RoleDefinition } from '../role/role-definition';
import type { RoleDiscovery } from './role-discovery';
import { summarizePromptBody } from './summarize-prompt-body';

export function renderRolesListText(discovery: RoleDiscovery): string {
  if (discovery.roles.length === 0) {
    return 'No roles found.';
  }
  return discovery.roles
    .map((role: RoleDefinition): string => {
      const summary: string = summarizePromptBody(role.promptBody);
      return summary.length > 0 ? `${role.name}  ${summary}` : role.name;
    })
    .join('\n');
}
