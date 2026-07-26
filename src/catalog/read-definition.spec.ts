import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readDefinition } from './read-definition';

describe('readDefinition', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-read-definition-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('yields the definition of an existing file', async () => {
    const path: string = join(directory, 'AGENT.md');
    await writeFile(path, 'definition', 'utf8');

    expect(await readDefinition(path)).toBe('definition');
  });

  it('is null when the file is absent', async () => {
    expect(await readDefinition(join(directory, 'absent.md'))).toBeNull();
  });
});
