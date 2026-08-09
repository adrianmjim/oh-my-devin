import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { recordDirMtime } from '../observability/record-dir-mtime';
import { MODE_LOCK_STALE_MS } from './mode-lock-stale-ms';
import { MODE_LOCK_WAIT_MS } from './mode-lock-wait-ms';
import type { ModeStateAction } from './mode-state-action';

export async function withModeStateLock<T>(
  baseDir: string,
  action: ModeStateAction<T>,
): Promise<T> {
  const lockDir: string = join(baseDir, '.omd', 'modes.lock');
  await mkdir(dirname(lockDir), { recursive: true });
  const deadline: number = Date.now() + MODE_LOCK_WAIT_MS;
  let held: boolean = false;
  let waiting: boolean = true;
  while (waiting) {
    try {
      await mkdir(lockDir);
      held = true;
      waiting = false;
    } catch {
      const heldSince: number | null = await recordDirMtime(lockDir);
      if (heldSince !== null && Date.now() - heldSince > MODE_LOCK_STALE_MS) {
        await rm(lockDir, { recursive: true, force: true });
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
      await rm(lockDir, { recursive: true, force: true });
    }
  }
  return result;
}
