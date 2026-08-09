import { readFile } from 'node:fs/promises';
import { isSessionRegistryEntry } from './is-session-registry-entry';
import { isValidSessionId } from './is-valid-session-id';
import type { SessionId } from './session-id';
import type { SessionRegistryEntry } from './session-registry-entry';
import { SessionStatePaths } from './session-state-paths';

export async function readSessionSeen(
  baseDir: string,
  sessionId: SessionId,
): Promise<SessionRegistryEntry | null> {
  let entry: SessionRegistryEntry | null = null;
  if (isValidSessionId(sessionId)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(
        await readFile(new SessionStatePaths(baseDir, sessionId).seen, 'utf8'),
      );
    } catch {
      parsed = null;
    }
    if (isSessionRegistryEntry(parsed) && parsed.sessionId === sessionId) {
      entry = parsed;
    }
  }
  return entry;
}
