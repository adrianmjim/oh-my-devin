import { describe, expect, it } from 'vitest';
import { parsePermissionRule } from './parse-permission-rule';
import { permissionRuleMatchesPath } from './permission-rule-matches-path';

describe('permissionRuleMatchesPath', () => {
  it('matches an exact path for the same verb', () => {
    const rule = parsePermissionRule('Write(review.json)');
    expect(permissionRuleMatchesPath(rule, 'Write', 'review.json')).toBe(true);
  });

  it('does not match when the verb differs', () => {
    const rule = parsePermissionRule('Write(review.json)');
    expect(permissionRuleMatchesPath(rule, 'Read', 'review.json')).toBe(false);
  });

  it('matches any path under a `**` glob', () => {
    const rule = parsePermissionRule('Write(**)');
    expect(permissionRuleMatchesPath(rule, 'Write', 'a/b/c.txt')).toBe(true);
  });

  it('keeps a single `*` from crossing a path separator', () => {
    const rule = parsePermissionRule('Write(src/*)');
    expect(permissionRuleMatchesPath(rule, 'Write', 'src/a.ts')).toBe(true);
    expect(permissionRuleMatchesPath(rule, 'Write', 'src/a/b.ts')).toBe(false);
  });

  it('matches every path for a bare verb', () => {
    const rule = parsePermissionRule('Write');
    expect(permissionRuleMatchesPath(rule, 'Write', 'anything.txt')).toBe(true);
  });
});
