import { MemoryStorePaths } from './memory-store-paths';
import type { ProfileSnapshot } from './profile-snapshot';
import { writeFileAtomically } from './write-file-atomically';

export async function writeProfile(
  baseDir: string,
  snapshot: ProfileSnapshot,
): Promise<void> {
  const paths: MemoryStorePaths = new MemoryStorePaths(baseDir);
  await writeFileAtomically(
    paths.profile,
    `${JSON.stringify(snapshot, null, 2)}\n`,
  );
}
