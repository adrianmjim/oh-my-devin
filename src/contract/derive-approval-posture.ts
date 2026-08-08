import type { AgentConfigBundle } from './agent-config-bundle';
import type { ApprovalPosture } from './approval-posture';
import { EXEC_VERB } from './exec-verb';
import type { PermissionRule } from './permission-rule';
import { parsePermissionRule } from './parse-permission-rule';

export function deriveApprovalPosture(
  bundle: AgentConfigBundle,
): ApprovalPosture {
  const executionGranted: boolean = bundle.permissions.allow.some(
    (raw: string): boolean => {
      const rule: PermissionRule = parsePermissionRule(raw);
      return rule.verb === EXEC_VERB;
    },
  );
  return executionGranted ? 'command-execution' : 'artifact-write';
}
