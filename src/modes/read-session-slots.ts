import { readFile } from 'node:fs/promises';
import { isModeActivation } from './is-mode-activation';
import { isValidSessionId } from './is-valid-session-id';
import type { ModeActivation } from './mode-activation';
import type { SessionId } from './session-id';
import { SessionStatePaths } from './session-state-paths';

export async function readSessionSlots(
  baseDir: string,
  sessionId: SessionId,
): Promise<readonly ModeActivation[]> {
  let activations: readonly ModeActivation[] = [];
  if (isValidSessionId(sessionId)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(
        await readFile(new SessionStatePaths(baseDir, sessionId).slots, 'utf8'),
      );
    } catch {
      parsed = null;
    }
    if (Array.isArray(parsed)) {
      activations = parsed
        .filter(isModeActivation)
        .filter(
          (entry: ModeActivation): boolean => entry.sessionId === sessionId,
        );
    }
  }
  return activations;
}
