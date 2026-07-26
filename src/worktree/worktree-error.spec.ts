import { describe, expect, it } from 'vitest';
import { WorktreeError } from './worktree-error';

describe('WorktreeError', () => {
  it('is an error carrying its message', () => {
    const error: WorktreeError = new WorktreeError('git add failed');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('git add failed');
  });

  it('names itself so it survives serialization', () => {
    expect(new WorktreeError('x').name).toBe('WorktreeError');
  });
});
