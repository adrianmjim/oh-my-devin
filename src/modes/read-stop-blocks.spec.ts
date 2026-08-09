import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readStopBlocks } from './read-stop-blocks';
import { SessionStatePaths } from './session-state-paths';
import { writeStopBlocks } from './write-stop-blocks';

describe('readStopBlocks', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-stop-blocks-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('counts no blocked stop for a fresh session', async () => {
    expect(await readStopBlocks(projectDir, 'sess-1')).toBe(0);
  });

  it('reads back the recorded count', async () => {
    await writeStopBlocks(projectDir, 'sess-1', 3);

    expect(await readStopBlocks(projectDir, 'sess-1')).toBe(3);
  });

  it('counts each session separately', async () => {
    await writeStopBlocks(projectDir, 'sess-1', 3);

    expect(await readStopBlocks(projectDir, 'sess-2')).toBe(0);
  });

  it('counts no blocked stop from an unreadable record', async () => {
    await writeStopBlocks(projectDir, 'sess-1', 3);
    await writeFile(
      new SessionStatePaths(projectDir, 'sess-1').stops,
      'not json',
      'utf8',
    );

    expect(await readStopBlocks(projectDir, 'sess-1')).toBe(0);
  });

  it('counts no blocked stop from a non-numeric count', async () => {
    await writeStopBlocks(projectDir, 'sess-1', 3);
    await writeFile(
      new SessionStatePaths(projectDir, 'sess-1').stops,
      '{"blocked":"three"}',
      'utf8',
    );

    expect(await readStopBlocks(projectDir, 'sess-1')).toBe(0);
  });
});
