import { writeFileAtomically } from '../memory/write-file-atomically';
import { isValidSessionId } from './is-valid-session-id';
import type { SessionId } from './session-id';
import { SessionStatePaths } from './session-state-paths';

export async function writeStopBlocks(
  baseDir: string,
  sessionId: SessionId,
  blocked: number,
): Promise<void> {
  if (isValidSessionId(sessionId)) {
    await writeFileAtomically(
      new SessionStatePaths(baseDir, sessionId).stops,
      `${JSON.stringify({ blocked }, null, 2)}\n`,
    );
  }
}
