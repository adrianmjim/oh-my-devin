import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { RunClaim } from '../observability/run-claim';
import { claimCoversDirectory } from './claim-covers-directory';

const WORKTREE: string = resolve('/project/.omd/worktrees/w1');

function claim(overrides: Partial<RunClaim>): RunClaim {
  return {
    workingDirectory: WORKTREE,
    worktreeProvisioned: true,
    sessionId: null,
    ...overrides,
  };
}

describe('claimCoversDirectory', () => {
  it('covers the claimed worktree and everything under it', () => {
    expect(claimCoversDirectory(claim({}), WORKTREE)).toBe(true);
    expect(claimCoversDirectory(claim({}), join(WORKTREE, 'src', 'a.ts'))).toBe(
      true,
    );
  });

  it('covers nothing when the run was given no worktree', () => {
    const shared: RunClaim = claim({
      workingDirectory: resolve('/project'),
      worktreeProvisioned: false,
    });

    expect(claimCoversDirectory(shared, resolve('/project'))).toBe(false);
    expect(claimCoversDirectory(shared, resolve('/project/src'))).toBe(false);
  });

  it('covers no sibling or parent of the claimed worktree', () => {
    expect(claimCoversDirectory(claim({}), `${WORKTREE}-sibling`)).toBe(false);
    expect(
      claimCoversDirectory(claim({}), resolve('/project/.omd/worktrees')),
    ).toBe(false);
    expect(claimCoversDirectory(claim({}), resolve('/project'))).toBe(false);
  });

  it('agrees on unnormalized spellings of the same directory', () => {
    expect(claimCoversDirectory(claim({}), join(WORKTREE, 'src', '..'))).toBe(
      true,
    );
    expect(claimCoversDirectory(claim({}), join(WORKTREE, '..'))).toBe(false);
  });
});
