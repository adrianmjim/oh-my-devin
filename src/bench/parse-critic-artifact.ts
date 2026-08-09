import { BenchFixtureError } from './bench-fixture-error';
import type { CriticArtifact } from './critic-artifact';
import type { CriticFinding } from './critic-finding';
import { isCriticCategory } from './is-critic-category';
import { isReviewerSeverity } from './is-reviewer-severity';
import { isReviewerVerdict } from './is-reviewer-verdict';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';

export function parseCriticArtifact(
  value: unknown,
  source: string,
): CriticArtifact {
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
    findings: findings.map((entry: unknown, index: number): CriticFinding => {
      const at: string = `${source}#findings[${index}]`;
      const finding: Record<string, unknown> = requireBenchFields(entry, at);
      const severity: unknown = finding['severity'];
      if (!isReviewerSeverity(severity)) {
        throw new BenchFixtureError(
          `"${at}.severity" must be critical, high, medium or low`,
        );
      }
      const category: unknown = finding['category'];
      if (!isCriticCategory(category)) {
        throw new BenchFixtureError(
          `"${at}.category" must be "present_flaw" or "missing_element"`,
        );
      }
      const located: unknown = finding['location'] ?? finding['absentElement'];
      return {
        severity,
        category,
        where: requireBenchString(located, `${at}.location/absentElement`),
        summary: requireBenchString(finding['summary'], `${at}.summary`),
        fix: requireBenchString(finding['fix'], `${at}.fix`),
      };
    }),
  };
}
