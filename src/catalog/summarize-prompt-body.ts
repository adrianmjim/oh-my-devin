import { isSummaryProse } from './is-summary-prose';
import { MAX_SUMMARY_LENGTH } from './max-summary-length';

export function summarizePromptBody(promptBody: string): string {
  const lines: readonly string[] = promptBody
    .split('\n')
    .map((line: string): string => line.trim());
  const firstLine: string =
    lines.find((line: string, index: number): boolean =>
      isSummaryProse(line, lines[index + 1] ?? ''),
    ) ?? '';
  return firstLine.length > MAX_SUMMARY_LENGTH
    ? `${firstLine.slice(0, MAX_SUMMARY_LENGTH - 3)}...`
    : firstLine;
}
