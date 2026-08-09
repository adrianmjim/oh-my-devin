import { rm } from 'node:fs/promises';
import { writeFileAtomically } from '../memory/write-file-atomically';
import { isSessionStale } from './is-session-stale';
import { isValidSessionId } from './is-valid-session-id';
import { MODE_STALENESS_THRESHOLD_MS } from './mode-staleness-threshold-ms';
import { readSessionSeen } from './read-session-seen';
import type { SessionId } from './session-id';
import type { SessionRegistryEntry } from './session-registry-entry';
import { SessionStatePaths } from './session-state-paths';

export async function recordSessionSeen(
  baseDir: string,
  sessionId: SessionId,
  seenAt: number,
): Promise<void> {
  if (isValidSessionId(sessionId)) {
    const paths: SessionStatePaths = new SessionStatePaths(baseDir, sessionId);
    const prior: SessionRegistryEntry | null = await readSessionSeen(
      baseDir,
      sessionId,
    );
    if (
      prior !== null &&
      isSessionStale(prior.lastSeenAt, seenAt, MODE_STALENESS_THRESHOLD_MS)
    ) {
      await rm(paths.dir, { recursive: true, force: true });
    }
    const entry: SessionRegistryEntry = { sessionId, lastSeenAt: seenAt };
    await writeFileAtomically(
      paths.seen,
      `${JSON.stringify(entry, null, 2)}\n`,
    );
  }
}
