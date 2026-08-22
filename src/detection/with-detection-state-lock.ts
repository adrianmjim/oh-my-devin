import { join } from 'node:path';
import type { DirectoryLock } from '../io/directory-lock';
import { withDirectoryLock } from '../io/with-directory-lock';
import { DETECTION_LOCK_STALE_MS } from './detection-lock-stale-ms';
import { DETECTION_LOCK_WAIT_MS } from './detection-lock-wait-ms';
import type { DetectionStateAction } from './detection-state-action';

export function withDetectionStateLock<T>(
  baseDir: string,
  action: DetectionStateAction<T>,
): Promise<T> {
  const lock: DirectoryLock = {
    dir: join(baseDir, '.omd', 'detection.lock'),
    staleMs: DETECTION_LOCK_STALE_MS,
    waitMs: DETECTION_LOCK_WAIT_MS,
  };
  return withDirectoryLock(lock, action);
}
