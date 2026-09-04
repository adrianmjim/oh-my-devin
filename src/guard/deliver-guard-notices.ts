import type { SessionId } from '../modes/session-id';
import type { PendingNotice } from './pending-notice';
import { readPendingNotices } from './read-pending-notices';
import { renderGuardNotices } from './render-guard-notices';
import { writePendingNotices } from './write-pending-notices';

export async function deliverGuardNotices(
  baseDir: string,
  sessionId: SessionId | null,
): Promise<string> {
  let delivered: string = '';
  if (sessionId !== null) {
    const queued: readonly PendingNotice[] = await readPendingNotices(
      baseDir,
      sessionId,
    );
    if (queued.length > 0) {
      await writePendingNotices(baseDir, sessionId, []);
      delivered = renderGuardNotices(queued);
    }
  }
  return delivered;
}
