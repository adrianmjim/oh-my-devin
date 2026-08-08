import { BenchFixtureError } from './bench-fixture-error';
import type { CriticTruthDocument } from './critic-truth-document';
import type { CriticTruthItem } from './critic-truth-item';
import { isCriticCategory } from './is-critic-category';
import { isReviewerSeverity } from './is-reviewer-severity';
import { isReviewerVerdict } from './is-reviewer-verdict';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';

export function parseCriticTruth(
  fields: Record<string, unknown>,
  source: string,
): CriticTruthDocument {
  const verdict: unknown = fields['expectedVerdict'];
  if (!isReviewerVerdict(verdict)) {
    throw new BenchFixtureError(
      `"${source}#expectedVerdict" must be "approve" or "request_changes"`,
    );
  }
  const findings: unknown = fields['findings'];
  if (!Array.isArray(findings)) {
    throw new BenchFixtureError(`"${source}#findings" must be an array`);
  }
  return {
    role: 'critic',
    expectedVerdict: verdict,
    findings: findings.map((entry: unknown, index: number): CriticTruthItem => {
      const at: string = `${source}#findings[${index}]`;
      const item: Record<string, unknown> = requireBenchFields(entry, at);
      const severity: unknown = item['severity'];
      if (!isReviewerSeverity(severity)) {
        throw new BenchFixtureError(
          `"${at}.severity" must be critical, high, medium or low`,
        );
      }
      const category: unknown = item['category'];
      if (!isCriticCategory(category)) {
        throw new BenchFixtureError(
          `"${at}.category" must be "present_flaw" or "missing_element"`,
        );
      }
      return {
        id: requireBenchString(item['id'], `${at}.id`),
        keywords: requireBenchKeywords(item['keywords'], `${at}.keywords`),
        severity,
        category,
      };
    }),
  };
}
