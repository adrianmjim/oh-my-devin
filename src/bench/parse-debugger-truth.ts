import { BenchFixtureError } from './bench-fixture-error';
import type { DebuggerTruthDocument } from './debugger-truth-document';
import type { DebuggerTruthItem } from './debugger-truth-item';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';

export function parseDebuggerTruth(
  fields: Record<string, unknown>,
  source: string,
): DebuggerTruthDocument {
  const causes: unknown = fields['causes'];
  if (!Array.isArray(causes)) {
    throw new BenchFixtureError(`"${source}#causes" must be an array`);
  }
  return {
    role: 'debugger',
    causes: causes.map((entry: unknown, index: number): DebuggerTruthItem => {
      const at: string = `${source}#causes[${index}]`;
      const item: Record<string, unknown> = requireBenchFields(entry, at);
      return {
        id: requireBenchString(item['id'], `${at}.id`),
        keywords: requireBenchKeywords(item['keywords'], `${at}.keywords`),
        location: requireBenchString(item['location'], `${at}.location`),
      };
    }),
  };
}
