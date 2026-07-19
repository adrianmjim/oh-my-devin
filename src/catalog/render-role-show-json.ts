import type { RoleDefinition } from '../role/role-definition';
import type { RoleContractJson } from './role-contract-json';
import { summarizePromptBody } from './summarize-prompt-body';

export function renderRoleShowJson(role: RoleDefinition): RoleContractJson {
  return {
    name: role.name,
    engine: role.engine,
    agentType: role.agentType,
    model: role.model,
    tools: role.tools,
    permissions: role.permissions,
    output: role.outputArtifact,
    schema: role.outputSchema,
    maxTurns: role.maxTurns,
    context: role.contextPolicy,
    wallTimeMs: role.wallTimeMs,
    promptSummary: summarizePromptBody(role.promptBody),
  };
}
