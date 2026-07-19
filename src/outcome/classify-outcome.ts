import type { FailureTier } from './failure-tier';
import type { OutcomeSignals } from './outcome-signals';

export function classifyOutcome(signals: OutcomeSignals): FailureTier | null {
  if (signals.denyHit) {
    return 'deny';
  }
  if (signals.artifactValid) {
    return null;
  }
  if (signals.repairAttempted) {
    return 'invalid_artifact';
  }
  if (signals.budgetExhausted) {
    return 'budget';
  }
  return 'invalid_artifact';
}
