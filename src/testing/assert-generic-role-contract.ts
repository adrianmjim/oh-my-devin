import { expect } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import { AGENT_TOOL_VOCABULARY } from './agent-tool-vocabulary';
import { ENGINE_FOREIGN_TOKENS } from './engine-foreign-tokens';
import { MAX_ROLE_BODY_LINES } from './max-role-body-lines';

export function assertGenericRoleContract(role: RoleDefinition): void {
  for (const token of ENGINE_FOREIGN_TOKENS) {
    expect(role.promptBody, token).not.toContain(token);
  }
  for (const tool of role.tools) {
    expect(role.promptBody, tool).toContain(`\`${tool}\``);
  }
  for (const tool of AGENT_TOOL_VOCABULARY) {
    if (!role.tools.includes(tool)) {
      expect(role.promptBody, tool).not.toContain(`\`${tool}\``);
    }
  }
  expect(role.promptBody).not.toContain('.devin/schemas/');
  expect(role.promptBody).not.toContain('omd-max-turns');
  expect(role.promptBody).not.toContain('omd-wall-time');
  expect(role.promptBody.split('\n').length).toBeLessThanOrEqual(
    MAX_ROLE_BODY_LINES,
  );
}
