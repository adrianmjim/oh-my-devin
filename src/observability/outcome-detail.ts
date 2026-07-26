import type { RunSnapshot } from './run-snapshot';

export function outcomeDetail(snapshot: RunSnapshot): string {
  switch (snapshot.state) {
    case 'succeeded':
      return 'success';
    case 'failed':
      return `failure (${snapshot.failureTier ?? 'unknown'})`;
    case 'running':
      return 'in progress';
    case 'stalled':
      return 'stalled — no recent liveness';
    case 'awaiting-gate':
      return `awaiting gate at ${snapshot.pendingGate ?? '(unknown)'}`;
  }
}
