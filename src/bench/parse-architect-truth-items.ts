import type { ArchitectTruthItem } from './architect-truth-item';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';

export function parseArchitectTruthItems(
  entries: readonly unknown[],
  source: string,
): readonly ArchitectTruthItem[] {
  return entries.map((entry: unknown, index: number): ArchitectTruthItem => {
    const at: string = `${source}[${index}]`;
    const fields: Record<string, unknown> = requireBenchFields(entry, at);
    return {
      id: requireBenchString(fields['id'], `${at}.id`),
      keywords: requireBenchKeywords(fields['keywords'], `${at}.keywords`),
    };
  });
}
