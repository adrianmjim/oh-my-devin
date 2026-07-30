import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { isValidRunId } from './is-valid-run-id';
import { recordDirMtime } from './record-dir-mtime';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';

export async function enumerateRunRecords(
  baseDir: string,
  now: number,
  windowMs: number,
): Promise<readonly RunId[]> {
  let entries: readonly Dirent[];
  try {
    entries = await readdir(join(baseDir, '.omd', 'runs'), {
      withFileTypes: true,
    });
  } catch {
    return [];
  }
  const found: RunId[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && isValidRunId(entry.name)) {
      const mtime: number | null = await recordDirMtime(
        new RunRecordPaths(baseDir, entry.name).dir,
      );
      if (mtime !== null && now - mtime <= windowMs) {
        found.push(entry.name);
      }
    }
  }
  return found;
}
