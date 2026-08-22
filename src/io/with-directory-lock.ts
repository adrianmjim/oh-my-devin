import { mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { recordDirMtime } from '../observability/record-dir-mtime';
import type { DirectoryLock } from './directory-lock';
import type { LockedAction } from './locked-action';

export async function withDirectoryLock<T>(
  lock: DirectoryLock,
  action: LockedAction<T>,
): Promise<T> {
  await mkdir(dirname(lock.dir), { recursive: true });
  const deadline: number = Date.now() + lock.waitMs;
  let held: boolean = false;
  let waiting: boolean = true;
  while (waiting) {
    try {
      await mkdir(lock.dir);
      held = true;
      waiting = false;
    } catch {
      const heldSince: number | null = await recordDirMtime(lock.dir);
      if (heldSince !== null && Date.now() - heldSince > lock.staleMs) {
        await rm(lock.dir, { recursive: true, force: true });
      } else if (Date.now() >= deadline) {
        waiting = false;
      } else {
        await new Promise<void>((resolve: () => void): void => {
          setTimeout(resolve, 25);
        });
      }
    }
  }
  let result: T;
  try {
    result = await action();
  } finally {
    if (held) {
      await rm(lock.dir, { recursive: true, force: true });
    }
  }
  return result;
}
