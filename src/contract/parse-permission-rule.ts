import { ContractCompilationError } from './contract-compilation-error';
import type { PermissionRule } from './permission-rule';

const RULE_PATTERN: RegExp = /^([A-Za-z][A-Za-z0-9]*)(?:\(([^)]*)\))?$/;

export function parsePermissionRule(raw: string): PermissionRule {
  const match: RegExpExecArray | null = RULE_PATTERN.exec(raw.trim());
  if (match === null) {
    throw new ContractCompilationError(`unrecognized permission rule "${raw}"`);
  }
  const verb: string = match[1] ?? '';
  const pattern: string | undefined = match[2];
  return { verb, pattern: pattern ?? null };
}
