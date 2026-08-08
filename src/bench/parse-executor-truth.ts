import { BenchFixtureError } from './bench-fixture-error';
import type { ExecutorTruthDocument } from './executor-truth-document';
import type { ExecutorTruthCriterion } from './executor-truth-criterion';
import type { ExecutorVerification } from './executor-verification';
import { isExecutorTestsClaim } from './is-executor-tests-claim';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';
import { requireBenchStrings } from './require-bench-strings';

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
  const verificationFields: Record<string, unknown> = requireBenchFields(
    fields['verification'],
    `${source}#verification`,
  );
  const verification: ExecutorVerification = {
    command: requireBenchString(
      verificationFields['command'],
      `${source}#verification.command`,
    ),
    args: requireBenchStrings(
      verificationFields['args'],
      `${source}#verification.args`,
    ),
  };
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
    verification,
    protectedPaths: requireBenchStrings(
      fields['protectedPaths'],
      `${source}#protectedPaths`,
    ),
  };
}
