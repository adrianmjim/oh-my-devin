import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DetectionStatePaths } from './detection-state-paths';
import { readTranscriptCursors } from './read-transcript-cursors';

describe('readTranscriptCursors', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-cursors-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeRaw(raw: string): Promise<void> {
    const paths: DetectionStatePaths = new DetectionStatePaths(projectDir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.cursors, raw, 'utf8');
  }

  it('reads nothing where no cursor was ever recorded', async () => {
    expect(await readTranscriptCursors(projectDir)).toEqual([]);
  });

  it('reads the recorded cursors', async () => {
    await writeRaw(JSON.stringify([{ sessionId: 'sess-1', lastRowId: 12 }]));

    expect(await readTranscriptCursors(projectDir)).toEqual([
      { sessionId: 'sess-1', lastRowId: 12 },
    ]);
  });

  it('reads nothing out of an unparseable file', async () => {
    await writeRaw('not json at all');

    expect(await readTranscriptCursors(projectDir)).toEqual([]);
  });

  it('drops a malformed cursor and keeps the rest', async () => {
    await writeRaw(
      JSON.stringify([
        { sessionId: 'sess-1' },
        { sessionId: 'sess-2', lastRowId: 3 },
      ]),
    );

    expect(await readTranscriptCursors(projectDir)).toEqual([
      { sessionId: 'sess-2', lastRowId: 3 },
    ]);
  });
});
