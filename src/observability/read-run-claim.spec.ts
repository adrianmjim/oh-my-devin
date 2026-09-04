import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readRunClaim } from './read-run-claim';
import type { RunClaim } from './run-claim';
import { RunRecordPaths } from './run-record-paths';
import { writeRunClaim } from './write-run-claim';

const RUN_ID: string = 'run-claim-1';

describe('readRunClaim', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-read-claim-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('reads back what the run recorded', async () => {
    const claim: RunClaim = {
      workingDirectory: '/project',
      worktreeProvisioned: false,
      sessionId: 'session-a',
    };
    await writeRunClaim(baseDir, RUN_ID, claim);

    expect(await readRunClaim(baseDir, RUN_ID)).toEqual(claim);
  });

  it('resolves a run that recorded no claim as absent', async () => {
    expect(await readRunClaim(baseDir, RUN_ID)).toBeNull();
  });

  it('resolves an unparseable or malformed claim as absent', async () => {
    const paths: RunRecordPaths = new RunRecordPaths(baseDir, RUN_ID);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.claim, '{ not json', 'utf8');

    expect(await readRunClaim(baseDir, RUN_ID)).toBeNull();

    await writeFile(paths.claim, JSON.stringify({ sessionId: 1 }), 'utf8');

    expect(await readRunClaim(baseDir, RUN_ID)).toBeNull();
  });
});
