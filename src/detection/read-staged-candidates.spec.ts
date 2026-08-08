import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DetectionStatePaths } from './detection-state-paths';
import { readStagedCandidates } from './read-staged-candidates';
import type { StagedCandidate } from './staged-candidate';

describe('readStagedCandidates', () => {
  let projectDir: string;
  let paths: DetectionStatePaths;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-candidates-'));
    paths = new DetectionStatePaths(projectDir);
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeStaging(content: string): Promise<void> {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.candidates, content, 'utf8');
  }

  it('reads empty staging from a project that never staged one', async () => {
    expect(await readStagedCandidates(projectDir)).toEqual([]);
  });

  it('reads back the candidates the staging holds', async () => {
    await writeStaging(
      JSON.stringify([
        {
          principle: 'In this project, always lint.',
          confirmingCommand: 'omd memory remember "In this project, always lint."',
          score: 0.8,
          expiresAt: 5_000,
          deliveredAt: null,
        },
      ]),
    );

    const staged: readonly StagedCandidate[] =
      await readStagedCandidates(projectDir);

    expect(staged).toHaveLength(1);
    expect(staged[0]?.principle).toBe('In this project, always lint.');
  });

  it('degrades to empty staging on unreadable content', async () => {
    await writeStaging('{ not json');

    expect(await readStagedCandidates(projectDir)).toEqual([]);
  });

  it('drops staging entries omd does not recognize', async () => {
    await writeStaging(JSON.stringify([{ principle: 'only a principle' }]));

    expect(await readStagedCandidates(projectDir)).toEqual([]);
  });
});
