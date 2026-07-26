import type { TargetOutcome } from './target-outcome';

export const CLAIMABLE_SCRIPT_OUTCOMES: ReadonlySet<TargetOutcome> =
  new Set<TargetOutcome>(['created', 'updated', 'unchanged', 'preserved']);
