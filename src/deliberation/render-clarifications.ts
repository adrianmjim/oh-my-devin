import type { RelayedClarification } from './relayed-clarification';

export function renderClarifications(
  clarifications: readonly RelayedClarification[],
): string {
  return clarifications
    .map(
      (clarification: RelayedClarification): string =>
        `- Q: ${clarification.question}\n  A: ${clarification.answer ?? '(unanswered)'}`,
    )
    .join('\n');
}
