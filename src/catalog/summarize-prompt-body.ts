const MAX_SUMMARY_LENGTH: number = 80;

export function summarizePromptBody(promptBody: string): string {
  const firstLine: string =
    promptBody
      .split('\n')
      .map((line: string): string => line.trim())
      .find((line: string): boolean => line.length > 0) ?? '';
  return firstLine.length > MAX_SUMMARY_LENGTH
    ? `${firstLine.slice(0, MAX_SUMMARY_LENGTH - 3)}...`
    : firstLine;
}
