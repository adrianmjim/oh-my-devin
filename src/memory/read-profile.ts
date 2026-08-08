import { readFile } from 'node:fs/promises';
import { isProfileSnapshot } from './is-profile-snapshot';
import { MemoryStorePaths } from './memory-store-paths';
import type { ProfileSnapshot } from './profile-snapshot';

export async function readProfile(
  baseDir: string,
): Promise<ProfileSnapshot | null> {
  let raw: string;
  try {
    raw = await readFile(new MemoryStorePaths(baseDir).profile, 'utf8');
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  return isProfileSnapshot(parsed) ? parsed : null;
}
