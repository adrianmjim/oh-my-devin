import { isDissentUnchanged } from './is-dissent-unchanged';
import type { TerminationDecision } from './termination-decision';
import type { TerminationInput } from './termination-input';

export function evaluateTermination(
  input: TerminationInput,
): TerminationDecision {
  if (input.consented) {
    return { terminated: true, closure: 'passed' };
  }
  if (isDissentUnchanged(input.blocking, input.previousBlocking)) {
    return { terminated: true, closure: 'blocked' };
  }
  if (input.round >= input.roundsCap) {
    return { terminated: true, closure: 'bankrupt' };
  }
  if (input.wallTimeExceeded) {
    return { terminated: true, closure: 'bankrupt' };
  }
  return { terminated: false, closure: null };
}
