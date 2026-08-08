import { deriveProfileSnapshot } from './derive-profile-snapshot';
import { PROFILE_STALENESS_WINDOW_MS } from './profile-staleness-window-ms';
import type { ProfileSnapshot } from './profile-snapshot';
import { readProfile } from './read-profile';
import { writeProfile } from './write-profile';

export async function loadProjectProfile(
  baseDir: string,
  now: number,
): Promise<ProfileSnapshot> {
  const cached: ProfileSnapshot | null = await readProfile(baseDir);
  let snapshot: ProfileSnapshot;
  if (
    cached !== null &&
    cached.derivedAt <= now &&
    now - cached.derivedAt < PROFILE_STALENESS_WINDOW_MS
  ) {
    snapshot = cached;
  } else {
    snapshot = await deriveProfileSnapshot(baseDir, now);
    await writeProfile(baseDir, snapshot);
  }
  return snapshot;
}
