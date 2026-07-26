import type { AnonymizedArgument } from './anonymized-argument';

export function renderPriorArguments(
  args: readonly AnonymizedArgument[],
): string {
  return args
    .map(
      (arg: AnonymizedArgument): string =>
        `- [${arg.kind}/${arg.severity}] ${arg.domain}: ${arg.concern}`,
    )
    .join('\n');
}
