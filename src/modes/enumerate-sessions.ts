import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { isValidSessionId } from './is-valid-session-id';
import { modeStateRoot } from './mode-state-root';
import { readSessionSeen } from './read-session-seen';
import type { SessionRegistryEntry } from './session-registry-entry';

export async function enumerateSessions(
  baseDir: string,
): Promise<readonly SessionRegistryEntry[]> {
  let partitions: readonly Dirent[];
  try {
    partitions = await readdir(modeStateRoot(baseDir), { withFileTypes: true });
  } catch {
    return [];
  }
  const found: SessionRegistryEntry[] = [];
  for (const partition of partitions) {
    if (partition.isDirectory() && isValidSessionId(partition.name)) {
      const entry: SessionRegistryEntry | null = await readSessionSeen(
        baseDir,
        partition.name,
      );
      if (entry !== null) {
        found.push(entry);
      }
    }
  }
  return found;
}
