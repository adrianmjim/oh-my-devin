import type { HookEvent } from './hook-event';
import { recordSessionSeen } from './record-session-seen';
import { stageSessionIdentity } from './stage-session-identity';

export async function handleToolUseEvent(
  baseDir: string,
  event: HookEvent,
  now: number,
): Promise<void> {
  if (event.sessionId !== null) {
    await recordSessionSeen(baseDir, event.sessionId, now);
    if (event.command !== null) {
      await stageSessionIdentity(baseDir, event.sessionId, event.command, now);
    }
  }
}
