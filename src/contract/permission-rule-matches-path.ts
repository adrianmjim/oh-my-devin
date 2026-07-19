import type { PermissionRule } from './permission-rule';

function globToRegExp(pattern: string): RegExp {
  let source: string = '';
  let index: number = 0;
  while (index < pattern.length) {
    const char: string = pattern[index] ?? '';
    if (char === '*') {
      if (pattern[index + 1] === '*') {
        source += '.*';
        index += 2;
        continue;
      }
      source += '[^/]*';
      index += 1;
      continue;
    }
    if (char === '?') {
      source += '[^/]';
      index += 1;
      continue;
    }
    source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    index += 1;
  }
  return new RegExp(`^${source}$`);
}

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
