import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readCandidate } from './read-candidate';
import type { RoleCandidate } from './role-candidate';

describe('readCandidate', () => {
  let directory: string;

  function candidate(definitionPath: string): RoleCandidate {
    return { level: 'project', baseDir: directory, definitionPath };
  }

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-read-candidate-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('yields the definition of an existing candidate', async () => {
    const path: string = join(directory, 'AGENT.md');
    await writeFile(path, 'definition', 'utf8');

    expect(await readCandidate(candidate(path))).toBe('definition');
  });

  it('is null when the candidate has no definition', async () => {
    expect(
      await readCandidate(candidate(join(directory, 'AGENT.md'))),
    ).toBeNull();
  });
});
