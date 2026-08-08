import type { StopDecision } from './stop-decision';

export function renderStopOutput(
  decision: StopDecision,
): Record<string, unknown> {
  const specific: Record<string, unknown> =
    decision.reason === null
      ? { decision: decision.decision }
      : { decision: decision.decision, reason: decision.reason };
  return decision.reason === null
    ? { decision: decision.decision, hookSpecificOutput: specific }
    : {
        decision: decision.decision,
        reason: decision.reason,
        hookSpecificOutput: specific,
      };
}
