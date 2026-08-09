import { readFile } from 'node:fs/promises';
import { isValidSessionId } from './is-valid-session-id';
import type { SessionId } from './session-id';
import { SessionStatePaths } from './session-state-paths';

export async function readStopBlocks(
  baseDir: string,
  sessionId: SessionId,
): Promise<number> {
  let blocked: number = 0;
  if (isValidSessionId(sessionId)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(
        await readFile(new SessionStatePaths(baseDir, sessionId).stops, 'utf8'),
      );
    } catch {
      parsed = null;
    }
    if (typeof parsed === 'object' && parsed !== null) {
      const count: unknown = (parsed as Record<string, unknown>)['blocked'];
      blocked = typeof count === 'number' ? count : 0;
    }
  }
  return blocked;
}
