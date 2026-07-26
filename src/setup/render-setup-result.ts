import { OUTCOME_GROUPS } from './outcome-groups';
import { renderTargetEntry } from './render-target-entry';
import type { SetupResult } from './setup-result';
import type { TargetReport } from './target-report';

export function renderSetupResult(result: SetupResult): string {
  const lines: string[] = [];
  for (const group of OUTCOME_GROUPS) {
    const reports: readonly TargetReport[] = result.targets.filter(
      (report: TargetReport): boolean => report.outcome === group.outcome,
    );
    if (reports.length > 0) {
      lines.push(group.heading);
      lines.push(...reports.map(renderTargetEntry));
    }
  }
  if (result.refusals.length > 0) {
    lines.push('Refused:');
    for (const refusal of result.refusals) {
      lines.push(`  ${refusal.component} — ${refusal.reason}`);
    }
  }
  return lines.length === 0 ? 'Nothing to install.' : lines.join('\n');
}
