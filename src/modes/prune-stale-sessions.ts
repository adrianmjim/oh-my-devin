import { rm } from 'node:fs/promises';
import { enumerateSessions } from './enumerate-sessions';
import { isSessionStale } from './is-session-stale';
import type { SessionRegistryEntry } from './session-registry-entry';
import { SessionStatePaths } from './session-state-paths';

export async function pruneStaleSessions(
  baseDir: string,
  now: number,
  thresholdMs: number,
): Promise<void> {
  const sessions: readonly SessionRegistryEntry[] =
    await enumerateSessions(baseDir);
  for (const session of sessions) {
    if (isSessionStale(session.lastSeenAt, now, thresholdMs)) {
      await rm(new SessionStatePaths(baseDir, session.sessionId).dir, {
        recursive: true,
        force: true,
      });
    }
  }
}
