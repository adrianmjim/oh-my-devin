import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendNotepadEntry } from './append-notepad-entry';
import { contentHash } from './content-hash';
import { MEMORY_CLASS_CAP } from './memory-class-cap';
import { MemoryStorePaths } from './memory-store-paths';
import type { NotepadEntry } from './notepad-entry';
import { readNotepad } from './read-notepad';

describe('appendNotepadEntry', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-append-notepad-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('lands the entry in the durable subtree', async () => {
    await appendNotepadEntry(
      projectDir,
      'manual',
      'the gate runs on staging',
      5,
    );

    const entries: readonly NotepadEntry[] = await readNotepad(projectDir);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.kind).toBe('manual');
    expect(entries[0]?.text).toBe('the gate runs on staging');
    expect(entries[0]?.recordedAt).toBe(5);
    expect(entries[0]?.hash).toBe(contentHash('the gate runs on staging'));
  });

  it('collapses a repeat of the same text', async () => {
    await appendNotepadEntry(
      projectDir,
      'manual',
      'the gate runs on staging',
      5,
    );
    await appendNotepadEntry(
      projectDir,
      'manual',
      'the gate runs on staging',
      9,
    );

    expect(await readNotepad(projectDir)).toHaveLength(1);
  });

  it('keeps the notepad within its cap under repeated writes', async () => {
    for (
      let index: number = 0;
      index < MEMORY_CLASS_CAP.notepad + 10;
      index++
    ) {
      await appendNotepadEntry(projectDir, 'manual', `note ${index}`, index);
    }

    expect(await readNotepad(projectDir)).toHaveLength(
      MEMORY_CLASS_CAP.notepad,
    );
  });

  it('behaves identically whether or not the subtree is under version control', async () => {
    const versioned: string = await mkdtemp(join(tmpdir(), 'omd-versioned-'));
    await mkdir(join(versioned, '.git'), { recursive: true });
    await writeFile(join(versioned, '.gitignore'), '.omd/\n', 'utf8');

    try {
      for (const dir of [projectDir, versioned]) {
        await appendNotepadEntry(
          dir,
          'priority',
          'the gate runs on staging',
          5,
        );
        await appendNotepadEntry(dir, 'manual', 'the gate runs on staging', 9);
        await appendNotepadEntry(dir, 'working', 'reviewers read the diff', 11);
      }

      expect(
        await readFile(new MemoryStorePaths(versioned).notepad, 'utf8'),
      ).toBe(await readFile(new MemoryStorePaths(projectDir).notepad, 'utf8'));
    } finally {
      await rm(versioned, { recursive: true, force: true });
    }
  });
});
