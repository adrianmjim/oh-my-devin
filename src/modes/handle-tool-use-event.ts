import { applyWriteGuard } from '../guard/apply-write-guard';
import type { HookEvent } from './hook-event';
import { recordSessionSeen } from './record-session-seen';
import { stageSessionIdentity } from './stage-session-identity';

export async function handleToolUseEvent(
  baseDir: string,
  cwd: string,
  userConfigFile: string,
  event: HookEvent,
  now: number,
): Promise<Record<string, unknown>> {
  if (event.sessionId !== null) {
    await recordSessionSeen(baseDir, event.sessionId, now);
    if (event.command !== null) {
      await stageSessionIdentity(baseDir, event.sessionId, event.command, now);
    }
  }
  return applyWriteGuard(baseDir, cwd, userConfigFile, event, now);
}
