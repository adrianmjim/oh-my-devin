import type { TargetReport } from './target-report';

export function renderTargetEntry(report: TargetReport): string {
  return report.reason === null
    ? `  ${report.path}`
    : `  ${report.path} — ${report.reason}`;
}
