import { writeFileAtomically } from '../memory/write-file-atomically';
import { isValidSessionId } from './is-valid-session-id';
import type { SessionId } from './session-id';
import { SessionStatePaths } from './session-state-paths';
import type { StagedIdentity } from './staged-identity';

export async function writeStagedIdentities(
  baseDir: string,
  sessionId: SessionId,
  staged: readonly StagedIdentity[],
): Promise<void> {
  if (isValidSessionId(sessionId)) {
    await writeFileAtomically(
      new SessionStatePaths(baseDir, sessionId).staged,
      `${JSON.stringify(staged, null, 2)}\n`,
    );
  }
}
