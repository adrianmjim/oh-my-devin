import { writeFileAtomically } from '../memory/write-file-atomically';
import { isValidSessionId } from './is-valid-session-id';
import type { SessionId } from './session-id';
import type { SessionRegistryEntry } from './session-registry-entry';
import { SessionStatePaths } from './session-state-paths';

export async function recordSessionSeen(
  baseDir: string,
  sessionId: SessionId,
  seenAt: number,
): Promise<void> {
  if (isValidSessionId(sessionId)) {
    const entry: SessionRegistryEntry = { sessionId, lastSeenAt: seenAt };
    await writeFileAtomically(
      new SessionStatePaths(baseDir, sessionId).seen,
      `${JSON.stringify(entry, null, 2)}\n`,
    );
  }
}
