import { ContractCompilationError } from './contract-compilation-error';
import type { PermissionRule } from './permission-rule';
import { RULE_PATTERN } from './rule-pattern';

export function parsePermissionRule(raw: string): PermissionRule {
  const match: RegExpExecArray | null = RULE_PATTERN.exec(raw.trim());
  if (match === null) {
    throw new ContractCompilationError(`unrecognized permission rule "${raw}"`);
  }
  const verb: string = match[1] ?? '';
  const pattern: string | undefined = match[2];
  return { verb, pattern: pattern ?? null };
}
