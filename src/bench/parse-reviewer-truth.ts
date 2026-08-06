import { BenchFixtureError } from './bench-fixture-error';
import { isReviewerSeverity } from './is-reviewer-severity';
import { isReviewerVerdict } from './is-reviewer-verdict';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';
import type { ReviewerTruthDocument } from './reviewer-truth-document';
import type { ReviewerTruthItem } from './reviewer-truth-item';

export function parseReviewerTruth(
  fields: Record<string, unknown>,
  source: string,
): ReviewerTruthDocument {
  const verdict: unknown = fields['expectedVerdict'];
  if (!isReviewerVerdict(verdict)) {
    throw new BenchFixtureError(
      `"${source}#expectedVerdict" must be "approve" or "request_changes"`,
    );
  }
  const defects: unknown = fields['defects'];
  if (!Array.isArray(defects)) {
    throw new BenchFixtureError(`"${source}#defects" must be an array`);
  }
  return {
    role: 'reviewer',
    expectedVerdict: verdict,
    defects: defects.map((entry: unknown, index: number): ReviewerTruthItem => {
      const at: string = `${source}#defects[${index}]`;
      const item: Record<string, unknown> = requireBenchFields(entry, at);
      const severity: unknown = item['severity'];
      if (!isReviewerSeverity(severity)) {
        throw new BenchFixtureError(
          `"${at}.severity" must be critical, high, medium or low`,
        );
      }
      return {
        id: requireBenchString(item['id'], `${at}.id`),
        keywords: requireBenchKeywords(item['keywords'], `${at}.keywords`),
        severity,
      };
    }),
  };
}
