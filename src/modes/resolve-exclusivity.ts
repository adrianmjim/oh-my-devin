import type { ExclusivityOutcome } from './exclusivity-outcome';
import type { ModeActivation } from './mode-activation';
import { modeExclusivityOf } from './mode-exclusivity-of';
import type { SessionId } from './session-id';
import type { SessionLivenessPredicate } from './session-liveness-predicate';

export function resolveExclusivity(
  activations: readonly ModeActivation[],
  isLive: SessionLivenessPredicate,
  mode: string,
  sessionId: SessionId,
): ExclusivityOutcome {
  let outcome: ExclusivityOutcome = null;
  if (modeExclusivityOf(mode) === 'exclusive') {
    const conflicts: readonly ModeActivation[] = activations.filter(
      (slot: ModeActivation): boolean =>
        slot.mode !== mode &&
        modeExclusivityOf(slot.mode) === 'exclusive' &&
        isLive(slot.sessionId),
    );
    const held: ModeActivation | undefined = conflicts.find(
      (slot: ModeActivation): boolean => slot.sessionId !== sessionId,
    );
    const own: ModeActivation | undefined = conflicts.find(
      (slot: ModeActivation): boolean => slot.sessionId === sessionId,
    );
    if (held !== undefined) {
      outcome = {
        kind: 'refused',
        mode,
        reason: 'exclusive-conflict',
        holder: { mode: held.mode, sessionId: held.sessionId },
      };
    } else if (own !== undefined) {
      outcome = { kind: 'displaced', mode, displaced: own.mode };
    }
  }
  return outcome;
}
