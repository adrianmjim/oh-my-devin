import type { Severity } from './severity';
import { severityRank } from './severity-rank';

export function severityAtLeast(
  severity: Severity,
  threshold: Severity,
): boolean {
  return severityRank(severity) >= severityRank(threshold);
}
