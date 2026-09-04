import { writeFileAtomically } from '../memory/write-file-atomically';
import { isValidSessionId } from '../modes/is-valid-session-id';
import type { SessionId } from '../modes/session-id';
import { SessionStatePaths } from '../modes/session-state-paths';
import type { PendingNotice } from './pending-notice';

export async function writePendingNotices(
  baseDir: string,
  sessionId: SessionId,
  notices: readonly PendingNotice[],
): Promise<void> {
  if (isValidSessionId(sessionId)) {
    await writeFileAtomically(
      new SessionStatePaths(baseDir, sessionId).notices,
      `${JSON.stringify(notices, null, 2)}\n`,
    ).catch((): void => undefined);
  }
}
