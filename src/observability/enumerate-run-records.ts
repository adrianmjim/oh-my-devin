import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { isValidRunId } from './is-valid-run-id';
import { recordActivityAt } from './record-activity-at';
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
      const activityAt: number | null = await recordActivityAt(
        new RunRecordPaths(baseDir, entry.name),
      );
      if (activityAt !== null && now - activityAt <= windowMs) {
        found.push(entry.name);
      }
    }
  }
  return found;
}
