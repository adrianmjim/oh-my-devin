import { describe, expect, it } from 'vitest';
import { isWriteScope } from './is-write-scope';

describe('isWriteScope', () => {
  it('accepts the two write scopes', () => {
    expect(isWriteScope('artifact')).toBe(true);
    expect(isWriteScope('worktree')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isWriteScope('repository')).toBe(false);
    expect(isWriteScope('')).toBe(false);
    expect(isWriteScope(null)).toBe(false);
    expect(isWriteScope(undefined)).toBe(false);
  });
});
