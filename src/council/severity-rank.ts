import type { Severity } from './severity';
import { SEVERITY_ORDER } from './severity-order';

export function severityRank(severity: Severity): number {
  return SEVERITY_ORDER.indexOf(severity);
}
