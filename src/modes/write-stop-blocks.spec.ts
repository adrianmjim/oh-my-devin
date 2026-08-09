import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readStopBlocks } from './read-stop-blocks';
import { writeStopBlocks } from './write-stop-blocks';

describe('writeStopBlocks', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-write-stop-blocks-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('records the consecutive block count', async () => {
    await writeStopBlocks(projectDir, 'sess-1', 2);

    expect(await readStopBlocks(projectDir, 'sess-1')).toBe(2);
  });

  it('resets the count to zero', async () => {
    await writeStopBlocks(projectDir, 'sess-1', 2);
    await writeStopBlocks(projectDir, 'sess-1', 0);

    expect(await readStopBlocks(projectDir, 'sess-1')).toBe(0);
  });

  it('writes nothing for an id that would escape the root', async () => {
    await writeStopBlocks(projectDir, '../escape', 2);

    expect(await readStopBlocks(projectDir, '../escape')).toBe(0);
  });
});
