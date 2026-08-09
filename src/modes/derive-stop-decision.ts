import { deriveModeHold } from './derive-mode-hold';
import type { ModeActivation } from './mode-activation';
import { readSessionSlots } from './read-session-slots';
import { readStopBlocks } from './read-stop-blocks';
import type { SessionId } from './session-id';
import { STOP_BLOCK_ATTEMPT_BOUND } from './stop-block-attempt-bound';
import type { StopDecision } from './stop-decision';
import { writeStopBlocks } from './write-stop-blocks';

export async function deriveStopDecision(
  baseDir: string,
  sessionId: SessionId | null,
  now: number,
): Promise<StopDecision> {
  let decision: StopDecision = { decision: 'approve', reason: null };
  if (sessionId !== null) {
    const held: readonly ModeActivation[] = await readSessionSlots(
      baseDir,
      sessionId,
    );
    const holds: readonly string[] = (
      await Promise.all(
        held.map((slot: ModeActivation): Promise<string | null> =>
          deriveModeHold(baseDir, slot, now),
        ),
      )
    ).filter((hold: string | null): hold is string => hold !== null);
    const blocked: number = await readStopBlocks(baseDir, sessionId);
    if (holds.length === 0) {
      await writeStopBlocks(baseDir, sessionId, 0);
    } else if (blocked >= STOP_BLOCK_ATTEMPT_BOUND) {
      await writeStopBlocks(baseDir, sessionId, 0);
      decision = {
        decision: 'approve',
        reason: `omd blocked this stop ${String(STOP_BLOCK_ATTEMPT_BOUND)} times and is deferring to you: ${holds.join('; ')}`,
      };
    } else {
      await writeStopBlocks(baseDir, sessionId, blocked + 1);
      decision = { decision: 'block', reason: holds.join('; ') };
    }
  }
  return decision;
}
