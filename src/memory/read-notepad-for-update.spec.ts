import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStoreError } from './memory-store-error';
import { MemoryStorePaths } from './memory-store-paths';
import type { NotepadEntry } from './notepad-entry';
import { readNotepadForUpdate } from './read-notepad-for-update';

describe('readNotepadForUpdate', () => {
  let projectDir: string;
  let paths: MemoryStorePaths;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-notepad-update-'));
    paths = new MemoryStorePaths(projectDir);
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeNotepadFile(content: string): Promise<void> {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.notepad, content, 'utf8');
  }

  it('reads an empty notepad from a store that was never written', async () => {
    expect(await readNotepadForUpdate(projectDir)).toEqual([]);
  });

  it('reads back the entries the store holds', async () => {
    await writeNotepadFile(
      JSON.stringify([
        { kind: 'manual', text: 'a note', hash: 'abc', recordedAt: 7 },
      ]),
    );

    const entries: readonly NotepadEntry[] =
      await readNotepadForUpdate(projectDir);

    expect(entries).toEqual([
      { kind: 'manual', text: 'a note', hash: 'abc', recordedAt: 7 },
    ]);
  });

  it('refuses an unparseable store instead of reading it as empty', async () => {
    await writeNotepadFile('not json at all');

    await expect(readNotepadForUpdate(projectDir)).rejects.toThrow(
      MemoryStoreError,
    );
  });

  it('refuses a store that is no list of entries', async () => {
    await writeNotepadFile(JSON.stringify({ kind: 'manual' }));

    await expect(readNotepadForUpdate(projectDir)).rejects.toThrow(
      MemoryStoreError,
    );
  });

  it('refuses a store holding an entry it does not recognize', async () => {
    await writeNotepadFile(
      JSON.stringify([
        { kind: 'manual', text: 'a note', hash: 'abc', recordedAt: 7 },
        { kind: 'shouting', text: 'a note', hash: 'abc', recordedAt: 7 },
      ]),
    );

    await expect(readNotepadForUpdate(projectDir)).rejects.toThrow(
      MemoryStoreError,
    );
  });
});
