import { BenchFixtureError } from './bench-fixture-error';
import type { ExecutorTruthDocument } from './executor-truth-document';
import type { ExecutorTruthCriterion } from './executor-truth-criterion';
import { isExecutorTestsClaim } from './is-executor-tests-claim';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';

export function parseExecutorTruth(
  fields: Record<string, unknown>,
  source: string,
): ExecutorTruthDocument {
  const expectedTests: unknown = fields['expectedTests'];
  if (!isExecutorTestsClaim(expectedTests)) {
    throw new BenchFixtureError(
      `"${source}#expectedTests" must be "passed" or "failed"`,
    );
  }
  const criteria: unknown = fields['criteria'];
  if (!Array.isArray(criteria) || criteria.length === 0) {
    throw new BenchFixtureError(
      `"${source}#criteria" must be a non-empty array`,
    );
  }
  return {
    role: 'executor',
    expectedTests,
    criteria: criteria.map(
      (entry: unknown, index: number): ExecutorTruthCriterion => {
        const at: string = `${source}#criteria[${index}]`;
        const item: Record<string, unknown> = requireBenchFields(entry, at);
        return {
          id: requireBenchString(item['id'], `${at}.id`),
          keywords: requireBenchKeywords(item['keywords'], `${at}.keywords`),
          path: requireBenchString(item['path'], `${at}.path`),
          contains: requireBenchKeywords(item['contains'], `${at}.contains`),
        };
      },
    ),
  };
}
