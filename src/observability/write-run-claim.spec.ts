import { chmod, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RunRecordPaths } from './run-record-paths';
import { writeRunClaim } from './write-run-claim';

const RUN_ID: string = 'run-claim-1';

describe('writeRunClaim', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-write-claim-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('records the directory the run launched in and its worktree kind', async () => {
    await writeRunClaim(baseDir, RUN_ID, {
      workingDirectory: '/project/.omd/worktrees/w1',
      worktreeProvisioned: true,
      sessionId: null,
    });

    const raw: string = await readFile(
      new RunRecordPaths(baseDir, RUN_ID).claim,
      'utf8',
    );

    expect(JSON.parse(raw)).toEqual({
      workingDirectory: '/project/.omd/worktrees/w1',
      worktreeProvisioned: true,
      sessionId: null,
    });
  });

  it('replaces the claim once the run learns its session', async () => {
    await writeRunClaim(baseDir, RUN_ID, {
      workingDirectory: '/project',
      worktreeProvisioned: false,
      sessionId: null,
    });
    await writeRunClaim(baseDir, RUN_ID, {
      workingDirectory: '/project',
      worktreeProvisioned: false,
      sessionId: 'session-a',
    });

    const raw: string = await readFile(
      new RunRecordPaths(baseDir, RUN_ID).claim,
      'utf8',
    );

    expect(JSON.parse(raw)).toMatchObject({ sessionId: 'session-a' });
  });

  it('stays silent when the claim cannot be written', async () => {
    const runsDir: string = join(baseDir, '.omd', 'runs');
    await mkdir(runsDir, { recursive: true });
    await chmod(runsDir, 0o500);

    await expect(
      writeRunClaim(baseDir, RUN_ID, {
        workingDirectory: '/project',
        worktreeProvisioned: false,
        sessionId: null,
      }),
    ).resolves.toBeUndefined();

    await chmod(runsDir, 0o700);
  });
});
