import { readFile } from 'node:fs/promises';
import { isStagedIdentity } from './is-staged-identity';
import { isValidSessionId } from './is-valid-session-id';
import type { SessionId } from './session-id';
import { SessionStatePaths } from './session-state-paths';
import type { StagedIdentity } from './staged-identity';

export async function readStagedIdentities(
  baseDir: string,
  sessionId: SessionId,
): Promise<readonly StagedIdentity[]> {
  let staged: readonly StagedIdentity[] = [];
  if (isValidSessionId(sessionId)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(
        await readFile(
          new SessionStatePaths(baseDir, sessionId).staged,
          'utf8',
        ),
      );
    } catch {
      parsed = null;
    }
    if (Array.isArray(parsed)) {
      staged = parsed.filter(isStagedIdentity);
    }
  }
  return staged;
}
