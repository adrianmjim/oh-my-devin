import type { RunObserver } from '../observability/run-observer';
import type { FailureTier } from '../outcome/failure-tier';

export async function recordTerminalOutcome(
  observer: RunObserver | undefined,
  timestamp: number,
  succeeded: boolean,
  failureTier: FailureTier | null,
): Promise<void> {
  await observer?.append({
    type: 'terminalOutcome',
    timestamp,
    succeeded,
    failureTier,
  });
}
