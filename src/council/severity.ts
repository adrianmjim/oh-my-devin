export type Severity = 'low' | 'medium' | 'high' | 'critical';

const ORDER: readonly Severity[] = ['low', 'medium', 'high', 'critical'];

export function isSeverity(value: unknown): value is Severity {
  return (
    typeof value === 'string' && (ORDER as readonly string[]).includes(value)
  );
}

export function severityRank(severity: Severity): number {
  return ORDER.indexOf(severity);
}

export function severityAtLeast(
  severity: Severity,
  threshold: Severity,
): boolean {
  return severityRank(severity) >= severityRank(threshold);
}
