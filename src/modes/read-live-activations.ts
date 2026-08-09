import { enumerateSessions } from './enumerate-sessions';
import { isSessionStale } from './is-session-stale';
import type { ModeActivation } from './mode-activation';
import { readSessionSlots } from './read-session-slots';
import type { SessionRegistryEntry } from './session-registry-entry';

export async function readLiveActivations(
  baseDir: string,
  now: number,
  thresholdMs: number,
): Promise<readonly ModeActivation[]> {
  const sessions: readonly SessionRegistryEntry[] =
    await enumerateSessions(baseDir);
  const live: ModeActivation[] = [];
  for (const session of sessions) {
    if (!isSessionStale(session.lastSeenAt, now, thresholdMs)) {
      live.push(...(await readSessionSlots(baseDir, session.sessionId)));
    }
  }
  return live;
}
