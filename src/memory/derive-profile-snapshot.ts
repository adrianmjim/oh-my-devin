import { readFile, readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join } from 'node:path';
import { EXCLUDED_LAYOUT_DIRS } from './excluded-layout-dirs';
import { PROFILE_STACK_MARKERS } from './profile-stack-markers';
import type { ProfileSnapshot } from './profile-snapshot';
import { readEntryCommands } from './read-entry-commands';

export async function deriveProfileSnapshot(
  baseDir: string,
  derivedAt: number,
): Promise<ProfileSnapshot> {
  let entries: readonly Dirent[];
  try {
    entries = await readdir(baseDir, { withFileTypes: true });
  } catch {
    entries = [];
  }
  const present: ReadonlySet<string> = new Set(
    entries.map((entry: Dirent): string => entry.name),
  );
  const stack: readonly string[] = Object.keys(PROFILE_STACK_MARKERS)
    .filter((marker: string): boolean => present.has(marker))
    .map((marker: string): string => PROFILE_STACK_MARKERS[marker] ?? marker);
  const layout: readonly string[] = entries
    .filter((entry: Dirent): boolean => entry.isDirectory())
    .map((entry: Dirent): string => entry.name)
    .filter(
      (name: string): boolean =>
        !name.startsWith('.') && !EXCLUDED_LAYOUT_DIRS.includes(name),
    )
    .sort();
  const manifest: string | null = present.has('package.json')
    ? await readFile(join(baseDir, 'package.json'), 'utf8').catch(
        (): null => null,
      )
    : null;
  return {
    stack,
    layout,
    entryCommands: readEntryCommands(manifest),
    derivedAt,
  };
}
