import type { RoleDefinition } from '../role/role-definition';
import { orNone } from './or-none';
import { summarizePromptBody } from './summarize-prompt-body';

export function renderRoleShowText(role: RoleDefinition): string {
  return [
    `name:            ${role.name}`,
    `engine:          ${role.engine}`,
    `agent_type:      ${role.agentType ?? '(unset)'}`,
    `model:           ${role.model ?? '(engine default)'}`,
    `tools:           ${orNone(role.tools)}`,
    `permissions:     allow=[${orNone(role.permissions.allow)}] deny=[${orNone(role.permissions.deny)}] ask=[${orNone(role.permissions.ask)}]`,
    `omd-output:      ${role.outputArtifact}`,
    `omd-schema:      ${role.outputSchema}`,
    `omd-max-turns:   ${role.maxTurns}`,
    `omd-context:     ${role.contextPolicy}`,
    `omd-wall-time:   ${role.wallTimeMs === null ? '(unset)' : `${role.wallTimeMs}ms`}`,
    `omd-write-scope: ${role.writeScope}`,
    `omd-memory:      ${orNone(role.memorySelection)}`,
    `summary:         ${summarizePromptBody(role.promptBody)}`,
  ].join('\n');
}
