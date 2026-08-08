import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorePaths } from './memory-store-paths';
import type { NotepadEntry } from './notepad-entry';
import { readNotepad } from './read-notepad';

describe('readNotepad', () => {
  let projectDir: string;
  let paths: MemoryStorePaths;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-read-notepad-'));
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
    expect(await readNotepad(projectDir)).toEqual([]);
  });

  it('reads back the entries the store holds', async () => {
    await writeNotepadFile(
      JSON.stringify([
        { kind: 'manual', text: 'a note', hash: 'abc', recordedAt: 7 },
      ]),
    );

    const entries: readonly NotepadEntry[] = await readNotepad(projectDir);

    expect(entries).toEqual([
      { kind: 'manual', text: 'a note', hash: 'abc', recordedAt: 7 },
    ]);
  });

  it('reads an empty notepad from an unparseable store', async () => {
    await writeNotepadFile('not json at all');

    expect(await readNotepad(projectDir)).toEqual([]);
  });

  it('drops entries whose shape it does not recognize', async () => {
    await writeNotepadFile(
      JSON.stringify([
        { kind: 'manual', text: 'a note', hash: 'abc', recordedAt: 7 },
        { kind: 'shouting', text: 'a note', hash: 'abc', recordedAt: 7 },
        'not an entry',
      ]),
    );

    const entries: readonly NotepadEntry[] = await readNotepad(projectDir);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.text).toBe('a note');
  });
});
