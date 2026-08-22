import { join } from 'node:path';
import type { DirectoryLock } from '../io/directory-lock';
import { withDirectoryLock } from '../io/with-directory-lock';
import { MODE_LOCK_STALE_MS } from './mode-lock-stale-ms';
import { MODE_LOCK_WAIT_MS } from './mode-lock-wait-ms';
import type { ModeStateAction } from './mode-state-action';

export function withModeStateLock<T>(
  baseDir: string,
  action: ModeStateAction<T>,
): Promise<T> {
  const lock: DirectoryLock = {
    dir: join(baseDir, '.omd', 'modes.lock'),
    staleMs: MODE_LOCK_STALE_MS,
    waitMs: MODE_LOCK_WAIT_MS,
  };
  return withDirectoryLock(lock, action);
}
