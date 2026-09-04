import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
  it('covers the claimed worktree and everything under it', async () => {
    expect(await claimCoversDirectory(claim({}), WORKTREE)).toBe(true);
    expect(
      await claimCoversDirectory(claim({}), join(WORKTREE, 'src', 'a.ts')),
    ).toBe(true);
  });

  it('covers nothing when the run was given no worktree', async () => {
    const shared: RunClaim = claim({
      workingDirectory: resolve('/project'),
      worktreeProvisioned: false,
    });

    expect(await claimCoversDirectory(shared, resolve('/project'))).toBe(false);
    expect(await claimCoversDirectory(shared, resolve('/project/src'))).toBe(
      false,
    );
  });

  it('covers no sibling or parent of the claimed worktree', async () => {
    expect(await claimCoversDirectory(claim({}), `${WORKTREE}-sibling`)).toBe(
      false,
    );
    expect(
      await claimCoversDirectory(claim({}), resolve('/project/.omd/worktrees')),
    ).toBe(false);
    expect(await claimCoversDirectory(claim({}), resolve('/project'))).toBe(
      false,
    );
  });

  it('agrees on unnormalized spellings of the same directory', async () => {
    expect(
      await claimCoversDirectory(claim({}), join(WORKTREE, 'src', '..')),
    ).toBe(true);
    expect(await claimCoversDirectory(claim({}), join(WORKTREE, '..'))).toBe(
      false,
    );
  });

  describe('across a symlinked path', () => {
    let root: string;

    beforeEach(async () => {
      root = await mkdtemp(join(tmpdir(), 'omd-claim-symlink-'));
    });

    afterEach(async () => {
      await rm(root, { recursive: true, force: true });
    });

    it('covers a session whose directory is spelled through a link', async () => {
      const real: string = join(root, 'real', 'worktree');
      await mkdir(join(real, 'src'), { recursive: true });
      const link: string = join(root, 'link');
      await symlink(join(root, 'real'), link, 'dir');

      const claimed: RunClaim = claim({ workingDirectory: real });

      expect(await claimCoversDirectory(claimed, join(link, 'worktree'))).toBe(
        true,
      );
      expect(
        await claimCoversDirectory(claimed, join(link, 'worktree', 'src')),
      ).toBe(true);
    });

    it('covers a session when the claim itself was recorded through a link', async () => {
      const real: string = join(root, 'real', 'worktree');
      await mkdir(join(real, 'src'), { recursive: true });
      const link: string = join(root, 'link');
      await symlink(join(root, 'real'), link, 'dir');

      const claimed: RunClaim = claim({
        workingDirectory: join(link, 'worktree'),
      });

      expect(await claimCoversDirectory(claimed, join(real, 'src'))).toBe(true);
    });

    it('still covers no sibling reached through the same link', async () => {
      const real: string = join(root, 'real', 'worktree');
      await mkdir(join(root, 'real', 'other'), { recursive: true });
      await mkdir(real, { recursive: true });
      const link: string = join(root, 'link');
      await symlink(join(root, 'real'), link, 'dir');

      const claimed: RunClaim = claim({ workingDirectory: real });

      expect(await claimCoversDirectory(claimed, join(link, 'other'))).toBe(
        false,
      );
    });
  });
});
