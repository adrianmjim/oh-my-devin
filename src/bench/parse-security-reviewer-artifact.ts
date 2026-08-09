import { BenchFixtureError } from './bench-fixture-error';
import { isReviewerSeverity } from './is-reviewer-severity';
import { isReviewerVerdict } from './is-reviewer-verdict';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';
import type { ReviewerArtifact } from './reviewer-artifact';
import type { ReviewerFinding } from './reviewer-finding';

export function parseSecurityReviewerArtifact(
  value: unknown,
  source: string,
): ReviewerArtifact {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const verdict: unknown = fields['verdict'];
  if (!isReviewerVerdict(verdict)) {
    throw new BenchFixtureError(
      `"${source}#verdict" must be "approve" or "request_changes"`,
    );
  }
  const findings: unknown = fields['findings'];
  if (!Array.isArray(findings)) {
    throw new BenchFixtureError(`"${source}#findings" must be an array`);
  }
  return {
    verdict,
    findings: findings.map((entry: unknown, index: number): ReviewerFinding => {
      const at: string = `${source}#findings[${index}]`;
      const finding: Record<string, unknown> = requireBenchFields(entry, at);
      const severity: unknown = finding['severity'];
      if (!isReviewerSeverity(severity)) {
        throw new BenchFixtureError(
          `"${at}.severity" must be critical, high, medium or low`,
        );
      }
      return {
        severity,
        location: requireBenchString(finding['location'], `${at}.location`),
        summary: requireBenchString(finding['category'], `${at}.category`),
        fix: requireBenchString(finding['remediation'], `${at}.remediation`),
      };
    }),
  };
}
