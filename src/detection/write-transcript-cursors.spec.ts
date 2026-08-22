import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readTranscriptCursors } from './read-transcript-cursors';
import { writeTranscriptCursors } from './write-transcript-cursors';

describe('writeTranscriptCursors', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-cursors-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('records cursors the reader reads back', async () => {
    await writeTranscriptCursors(projectDir, [
      { sessionId: 'sess-1', lastRowId: 12 },
    ]);

    expect(await readTranscriptCursors(projectDir)).toEqual([
      { sessionId: 'sess-1', lastRowId: 12 },
    ]);
  });

  it('replaces what an earlier write recorded', async () => {
    await writeTranscriptCursors(projectDir, [
      { sessionId: 'sess-1', lastRowId: 12 },
    ]);

    await writeTranscriptCursors(projectDir, [
      { sessionId: 'sess-1', lastRowId: 20 },
    ]);

    expect(await readTranscriptCursors(projectDir)).toEqual([
      { sessionId: 'sess-1', lastRowId: 20 },
    ]);
  });
});
