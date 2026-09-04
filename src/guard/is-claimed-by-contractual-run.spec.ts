import { mkdir, mkdtemp, rm, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RunClaim } from '../observability/run-claim';
import { RunRecordPaths } from '../observability/run-record-paths';
import { writeRunClaim } from '../observability/write-run-claim';
import { isClaimedByContractualRun } from './is-claimed-by-contractual-run';

const NOW: number = 1_000_000;

describe('isClaimedByContractualRun', () => {
  let baseDir: string;
  let worktree: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-contractual-'));
    worktree = join(baseDir, '.omd', 'worktrees', 'w1');
    await mkdir(worktree, { recursive: true });
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  async function claimRun(runId: string, claim: RunClaim): Promise<void> {
    await writeRunClaim(baseDir, runId, claim);
    const paths: RunRecordPaths = new RunRecordPaths(baseDir, runId);
    const fresh: Date = new Date(NOW);
    await utimes(paths.dir, fresh, fresh);
  }

  it('exempts a worktree run from its opening write, before any session id', async () => {
    await claimRun('run-worktree', {
      workingDirectory: worktree,
      worktreeProvisioned: true,
      sessionId: null,
    });

    expect(
      await isClaimedByContractualRun(
        baseDir,
        'unknown-session',
        worktree,
        NOW,
      ),
    ).toBe(true);
    expect(
      await isClaimedByContractualRun(
        baseDir,
        null,
        join(worktree, 'src'),
        NOW,
      ),
    ).toBe(true);
  });

  it('exempts a worktree run by the identity it reported', async () => {
    await claimRun('run-worktree', {
      workingDirectory: worktree,
      worktreeProvisioned: true,
      sessionId: 'role-session',
    });

    expect(
      await isClaimedByContractualRun(baseDir, 'role-session', baseDir, NOW),
    ).toBe(true);
  });

  it('exempts nobody by the identity of a run sharing the project directory', async () => {
    await claimRun('run-in-project', {
      workingDirectory: baseDir,
      worktreeProvisioned: false,
      sessionId: 'role-session',
    });

    expect(
      await isClaimedByContractualRun(baseDir, 'role-session', baseDir, NOW),
    ).toBe(false);
    expect(
      await isClaimedByContractualRun(baseDir, 'human-session', baseDir, NOW),
    ).toBe(false);
  });

  it('governs the interactive session while a project-directory run is live', async () => {
    await claimRun('run-in-project', {
      workingDirectory: baseDir,
      worktreeProvisioned: false,
      sessionId: null,
    });

    expect(
      await isClaimedByContractualRun(baseDir, 'human-session', baseDir, NOW),
    ).toBe(false);
  });

  it('governs an unknown session in an unclaimed directory', async () => {
    expect(
      await isClaimedByContractualRun(baseDir, 'human-session', baseDir, NOW),
    ).toBe(false);
  });

  it('governs a session once the claiming run has gone stale', async () => {
    await claimRun('run-worktree', {
      workingDirectory: worktree,
      worktreeProvisioned: true,
      sessionId: 'role-session',
    });
    const stale: number = NOW + 3_600_000;

    expect(
      await isClaimedByContractualRun(baseDir, 'role-session', worktree, stale),
    ).toBe(false);
  });

  it('does not exempt a directory merely named like the worktree', async () => {
    await claimRun('run-worktree', {
      workingDirectory: worktree,
      worktreeProvisioned: true,
      sessionId: null,
    });

    expect(
      await isClaimedByContractualRun(
        baseDir,
        null,
        `${worktree}-sibling`,
        NOW,
      ),
    ).toBe(false);
  });
});
