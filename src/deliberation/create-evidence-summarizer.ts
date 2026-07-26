import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { AnonymizedArgument } from './anonymized-argument';
import { composeSummaryPrompt } from './compose-summary-prompt';
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
