import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorePaths } from './memory-store-paths';
import type { NotepadEntry } from './notepad-entry';
import { readNotepad } from './read-notepad';
import { writeNotepad } from './write-notepad';

const ENTRIES: readonly NotepadEntry[] = [
  { kind: 'priority', text: 'a note', hash: 'abc', recordedAt: 7 },
];

describe('writeNotepad', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-write-notepad-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('creates the durable subtree on first write', async () => {
    await writeNotepad(projectDir, ENTRIES);

    expect(await readNotepad(projectDir)).toEqual(ENTRIES);
  });

  it('writes the notepad and nothing outside the memory subtree', async () => {
    const paths: MemoryStorePaths = new MemoryStorePaths(projectDir);

    await writeNotepad(projectDir, ENTRIES);

    expect(JSON.parse(await readFile(paths.notepad, 'utf8'))).toEqual(ENTRIES);
    await expect(readFile(paths.profile, 'utf8')).rejects.toThrow();
  });

  it('replaces the previous content rather than appending to it', async () => {
    await writeNotepad(projectDir, ENTRIES);

    await writeNotepad(projectDir, []);

    expect(await readNotepad(projectDir)).toEqual([]);
  });
});
