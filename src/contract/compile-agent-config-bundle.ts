import { isUnderMemorySubtree } from '../memory/is-under-memory-subtree';
import type { MemoryDelivery } from '../memory/memory-delivery';
import type { RoleDefinition } from '../role/role-definition';
import type { AgentConfigBundle } from './agent-config-bundle';
import { buildContractualPreamble } from './build-contractual-preamble';
import { ContractCompilationError } from './contract-compilation-error';
import type { PermissionRule } from './permission-rule';
import { parsePermissionRule } from './parse-permission-rule';
import { permissionRuleMatchesPath } from './permission-rule-matches-path';
import { worktreeWriteRule } from './worktree-write-rule';
import { WRITE_VERB } from './write-verb';

export function compileAgentConfigBundle(
  role: RoleDefinition,
  workingDirectory: string,
  memory: MemoryDelivery,
): AgentConfigBundle {
  const artifact: string = role.outputArtifact;

  if (isUnderMemorySubtree(artifact)) {
    throw new ContractCompilationError(
      `role "${role.name}": artifact "${artifact}" lies in the memory store, which no role session may write`,
    );
  }

  for (const denyRaw of role.permissions.deny) {
    const rule: PermissionRule = parsePermissionRule(denyRaw);
    if (permissionRuleMatchesPath(rule, WRITE_VERB, artifact)) {
      throw new ContractCompilationError(
        `role "${role.name}": deny rule "${denyRaw}" matches its own artifact "${artifact}"`,
      );
    }
  }

  const allow: string[] = [];
  let artifactWriteDeclared: boolean = false;
  for (const allowRaw of role.permissions.allow) {
    const rule: PermissionRule = parsePermissionRule(allowRaw);
    if (rule.verb === WRITE_VERB) {
      if (rule.pattern !== artifact) {
        throw new ContractCompilationError(
          `role "${role.name}": allow rule "${allowRaw}" grants a writable path other than its artifact "${artifact}"`,
        );
      }
      artifactWriteDeclared = true;
    }
    allow.push(allowRaw);
  }
  if (!artifactWriteDeclared) {
    allow.unshift(`Write(${artifact})`);
  }
  if (role.writeScope === 'worktree') {
    allow.push(worktreeWriteRule(workingDirectory));
  }

  return {
    system_instructions: [
      buildContractualPreamble(role, memory),
      role.promptBody,
    ],
    allowed_tools: role.tools,
    permissions: {
      allow,
      deny: role.permissions.deny,
      ask: role.permissions.ask,
    },
  };
}
