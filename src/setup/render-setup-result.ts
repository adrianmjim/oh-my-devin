import type { SetupResult, TargetOutcome, TargetReport } from './setup-result';

interface OutcomeGroup {
  readonly outcome: TargetOutcome;
  readonly heading: string;
}

const GROUPS: readonly OutcomeGroup[] = [
  { outcome: 'created', heading: 'Created:' },
  { outcome: 'updated', heading: 'Updated:' },
  { outcome: 'unchanged', heading: 'Unchanged:' },
  { outcome: 'preserved', heading: 'Preserved:' },
  { outcome: 'conflicted', heading: 'Conflicted:' },
  { outcome: 'blocked', heading: 'Blocked:' },
];

function entry(report: TargetReport): string {
  return report.reason === null
    ? `  ${report.path}`
    : `  ${report.path} — ${report.reason}`;
}

export function renderSetupResult(result: SetupResult): string {
  const lines: string[] = [];
  for (const group of GROUPS) {
    const reports: readonly TargetReport[] = result.targets.filter(
      (report: TargetReport): boolean => report.outcome === group.outcome,
    );
    if (reports.length > 0) {
      lines.push(group.heading);
      lines.push(...reports.map(entry));
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
