import { BenchFixtureError } from './bench-fixture-error';
import type { ExploreTruthDocument } from './explore-truth-document';
import type { ExploreTruthFile } from './explore-truth-file';
import type { KeywordItem } from './keyword-item';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';

export function parseExploreTruth(
  fields: Record<string, unknown>,
  source: string,
): ExploreTruthDocument {
  const files: unknown = fields['files'];
  if (!Array.isArray(files)) {
    throw new BenchFixtureError(`"${source}#files" must be an array`);
  }
  const relationships: unknown = fields['relationships'];
  if (!Array.isArray(relationships)) {
    throw new BenchFixtureError(`"${source}#relationships" must be an array`);
  }
  return {
    role: 'explore',
    files: files.map((entry: unknown, index: number): ExploreTruthFile => {
      const at: string = `${source}#files[${index}]`;
      const item: Record<string, unknown> = requireBenchFields(entry, at);
      return {
        id: requireBenchString(item['id'], `${at}.id`),
        path: requireBenchString(item['path'], `${at}.path`),
        keywords: requireBenchKeywords(item['keywords'], `${at}.keywords`),
      };
    }),
    relationships: relationships.map(
      (entry: unknown, index: number): KeywordItem => {
        const at: string = `${source}#relationships[${index}]`;
        const item: Record<string, unknown> = requireBenchFields(entry, at);
        return {
          id: requireBenchString(item['id'], `${at}.id`),
          keywords: requireBenchKeywords(item['keywords'], `${at}.keywords`),
        };
      },
    ),
  };
}
