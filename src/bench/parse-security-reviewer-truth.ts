import { BenchFixtureError } from './bench-fixture-error';
import { isReviewerSeverity } from './is-reviewer-severity';
import { isReviewerVerdict } from './is-reviewer-verdict';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';
import type { ReviewerTruthItem } from './reviewer-truth-item';
import type { SecurityReviewerTruthDocument } from './security-reviewer-truth-document';

export function parseSecurityReviewerTruth(
  fields: Record<string, unknown>,
  source: string,
): SecurityReviewerTruthDocument {
  const verdict: unknown = fields['expectedVerdict'];
  if (!isReviewerVerdict(verdict)) {
    throw new BenchFixtureError(
      `"${source}#expectedVerdict" must be "approve" or "request_changes"`,
    );
  }
  const vulnerabilities: unknown = fields['vulnerabilities'];
  if (!Array.isArray(vulnerabilities)) {
    throw new BenchFixtureError(`"${source}#vulnerabilities" must be an array`);
  }
  return {
    role: 'security-reviewer',
    expectedVerdict: verdict,
    vulnerabilities: vulnerabilities.map(
      (entry: unknown, index: number): ReviewerTruthItem => {
        const at: string = `${source}#vulnerabilities[${index}]`;
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
      },
    ),
  };
}
