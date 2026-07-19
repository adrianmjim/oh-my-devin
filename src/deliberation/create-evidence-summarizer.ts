import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { AnonymizedArgument } from './anonymized-argument';
import type { EvidenceSummarizer } from './evidence-summarizer';

export function createEvidenceSummarizer(
  runner: CommandRunner,
): EvidenceSummarizer {
  return async (
    args: readonly AnonymizedArgument[],
  ): Promise<string | null> => {
    let result: CommandResult;
    try {
      result = await runner.run({
        command: 'devin',
        args: ['-p', composeSummaryPrompt(args)],
      });
    } catch {
      return null;
    }
    if (result.exitCode !== 0) {
      return null;
    }
    const summary: string = result.stdout.trim();
    return summary.length > 0 ? summary : null;
  };
}

function composeSummaryPrompt(args: readonly AnonymizedArgument[]): string {
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
