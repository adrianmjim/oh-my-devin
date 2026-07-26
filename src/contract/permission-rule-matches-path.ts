import { globToRegExp } from './glob-to-reg-exp';
import type { PermissionRule } from './permission-rule';

export function permissionRuleMatchesPath(
  rule: PermissionRule,
  verb: string,
  path: string,
): boolean {
  if (rule.verb !== verb) {
    return false;
  }
  if (rule.pattern === null) {
    return true;
  }
  return globToRegExp(rule.pattern).test(path);
}
