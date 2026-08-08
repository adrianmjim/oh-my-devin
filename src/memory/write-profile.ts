import { mkdir, writeFile } from 'node:fs/promises';
import { MemoryStorePaths } from './memory-store-paths';
import type { ProfileSnapshot } from './profile-snapshot';

export async function writeProfile(
  baseDir: string,
  snapshot: ProfileSnapshot,
): Promise<void> {
  const paths: MemoryStorePaths = new MemoryStorePaths(baseDir);
  await mkdir(paths.dir, { recursive: true });
  await writeFile(paths.profile, `${JSON.stringify(snapshot, null, 2)}\n`);
}
