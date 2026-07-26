import type { AnonymizedArgument } from './anonymized-argument';

export function composeSummaryPrompt(
  args: readonly AnonymizedArgument[],
): string {
  const listed: string = args
    .map(
      (arg: AnonymizedArgument): string =>
        `- [${arg.kind}/${arg.severity}] ${arg.domain}: ${arg.concern}`,
    )
    .join('\n');
  return [
    'Write a neutral prose summary of the evidence in the following anonymized deliberation arguments. Do not take a side, do not rank the arguments, and do not speculate about who made them.',
    listed,
    'Reply with only the summary text.',
  ].join('\n\n');
}
