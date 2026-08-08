import { normalizeBenchText } from './normalize-bench-text';

export function keywordMatchScore(
  text: string,
  keywords: readonly string[],
): number {
  const haystack: string = normalizeBenchText(text);
  const matched: number = keywords.filter((keyword: string): boolean =>
    haystack.includes(normalizeBenchText(keyword).trimEnd()),
  ).length;
  return keywords.length === 0 ? 0 : matched / keywords.length;
}
