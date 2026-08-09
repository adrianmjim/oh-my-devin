import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorePaths } from '../memory/memory-store-paths';
import { readStagedCandidates } from './read-staged-candidates';
import type { StagedCandidate } from './staged-candidate';
import { writeStagedCandidates } from './write-staged-candidates';

const CANDIDATE: StagedCandidate = {
  principle: 'In this project, always run the linter before pushing.',
  confirmingCommand:
    'omd memory remember "In this project, always run the linter before pushing."',
  score: 0.8,
  sessionId: 'sess-1',
  expiresAt: 5_000,
  deliveredAt: null,
};

describe('writeStagedCandidates', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-stage-write-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('stages a candidate the reader reads back', async () => {
    await writeStagedCandidates(projectDir, [CANDIDATE]);

    expect(await readStagedCandidates(projectDir)).toEqual([CANDIDATE]);
  });

  it('carries the confirming invocation verbatim', async () => {
    await writeStagedCandidates(projectDir, [CANDIDATE]);

    const staged: readonly StagedCandidate[] =
      await readStagedCandidates(projectDir);

    expect(staged[0]?.confirmingCommand).toBe(CANDIDATE.confirmingCommand);
  });

  it('never writes the durable memory store', async () => {
    await writeStagedCandidates(projectDir, [CANDIDATE]);

    await expect(
      readdir(new MemoryStorePaths(projectDir).dir),
    ).rejects.toThrow();
  });
});
