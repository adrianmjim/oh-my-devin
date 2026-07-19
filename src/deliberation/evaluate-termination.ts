import type { TerminationDecision } from './termination-decision';
import type { TerminationInput } from './termination-input';
import type { TypedPosition } from './typed-position';

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

function isDissentUnchanged(
  current: readonly TypedPosition[],
  previous: readonly TypedPosition[],
): boolean {
  if (previous.length === 0) {
    return false;
  }
  return current.some((now: TypedPosition): boolean =>
    previous.some(
      (before: TypedPosition): boolean =>
        before.seat === now.seat && before.domain === now.domain,
    ),
  );
}
