import { describe, expect, it } from 'vitest';
import { ContractCompilationError } from './contract-compilation-error';
import { parsePermissionRule } from './parse-permission-rule';
import { worktreeWriteRule } from './worktree-write-rule';

describe('worktreeWriteRule', () => {
  it('grants every path under the working directory', () => {
    expect(worktreeWriteRule('/tmp/omd/worktrees/executor')).toBe(
      'Write(/tmp/omd/worktrees/executor/**)',
    );
  });

  it('emits a rule the permission grammar accepts', () => {
    expect(
      parsePermissionRule(worktreeWriteRule('/tmp/omd/worktrees/executor'))
        .pattern,
    ).toBe('/tmp/omd/worktrees/executor/**');
  });

  it('refuses a working directory the rule grammar cannot express', () => {
    expect(() => worktreeWriteRule('/tmp/project (copy)/wt')).toThrow(
      ContractCompilationError,
    );
    expect(() => worktreeWriteRule('/tmp/project (copy)/wt')).toThrow(
      /project \(copy\)/,
    );
  });
});
