import type { FailureTier } from './failure-tier';

export function exitCodeForOutcome(tier: FailureTier | null): number {
  switch (tier) {
    case null:
      return 0;
    case 'deny':
      return 2;
    case 'invalid_artifact':
      return 3;
    case 'budget':
      return 4;
  }
}
