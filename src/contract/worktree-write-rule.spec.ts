import { describe, expect, it } from 'vitest';
import { worktreeWriteRule } from './worktree-write-rule';

describe('worktreeWriteRule', () => {
  it('grants every path under the working directory', () => {
    expect(worktreeWriteRule('/tmp/omd/worktrees/executor')).toBe(
      'Write(/tmp/omd/worktrees/executor/**)',
    );
  });
});
