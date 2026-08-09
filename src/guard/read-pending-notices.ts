import { readFile } from 'node:fs/promises';
import { isValidSessionId } from '../modes/is-valid-session-id';
import type { SessionId } from '../modes/session-id';
import { SessionStatePaths } from '../modes/session-state-paths';
import { isPendingNotice } from './is-pending-notice';
import type { PendingNotice } from './pending-notice';

export async function readPendingNotices(
  baseDir: string,
  sessionId: SessionId,
): Promise<readonly PendingNotice[]> {
  let queued: readonly PendingNotice[] = [];
  if (isValidSessionId(sessionId)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(
        await readFile(
          new SessionStatePaths(baseDir, sessionId).notices,
          'utf8',
        ),
      );
    } catch {
      parsed = null;
    }
    if (Array.isArray(parsed)) {
      queued = parsed.filter(isPendingNotice);
    }
  }
  return queued;
}
