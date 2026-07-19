import type { ClosureState } from './closure-state';

export interface TerminationDecision {
  readonly terminated: boolean;
  readonly closure: ClosureState | null;
}
