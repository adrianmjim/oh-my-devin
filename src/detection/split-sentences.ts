export function splitSentences(text: string): readonly string[] {
  return text
    .split(/[.!?\n]+/)
    .map((fragment: string): string => fragment.trim())
    .filter((fragment: string): boolean => fragment !== '');
}
