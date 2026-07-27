export function bodyHeadings(promptBody: string): readonly string[] {
  return promptBody
    .split('\n')
    .filter((line: string): boolean => line.startsWith('## '))
    .map((line: string): string => line.slice(3).trim());
}
