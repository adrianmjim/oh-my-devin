import { writeFileAtomically } from '../memory/write-file-atomically';
import { isValidSessionId } from './is-valid-session-id';
import type { ModeActivation } from './mode-activation';
import type { SessionId } from './session-id';
import { SessionStatePaths } from './session-state-paths';

export async function writeSessionSlots(
  baseDir: string,
  sessionId: SessionId,
  activations: readonly ModeActivation[],
): Promise<void> {
  if (isValidSessionId(sessionId)) {
    await writeFileAtomically(
      new SessionStatePaths(baseDir, sessionId).slots,
      `${JSON.stringify(activations, null, 2)}\n`,
    );
  }
}
