import { describe, expect, it } from 'vitest';
import type { PermissionRule } from './permission-rule';
import { ContractCompilationError } from './contract-compilation-error';
import { parsePermissionRule } from './parse-permission-rule';

describe('parsePermissionRule', () => {
  it('parses a verb with a path pattern', () => {
    const rule: PermissionRule = parsePermissionRule('Write(review.json)');
    expect(rule).toEqual({ verb: 'Write', pattern: 'review.json' });
  });

  it('parses a bare verb as an all-paths rule', () => {
    const rule: PermissionRule = parsePermissionRule('Bash');
    expect(rule).toEqual({ verb: 'Bash', pattern: null });
  });

  it('parses a glob pattern', () => {
    const rule: PermissionRule = parsePermissionRule('Read(src/**)');
    expect(rule).toEqual({ verb: 'Read', pattern: 'src/**' });
  });

  it('throws on a malformed rule', () => {
    expect(() => parsePermissionRule('Write(unclosed')).toThrow(
      ContractCompilationError,
    );
  });
});
