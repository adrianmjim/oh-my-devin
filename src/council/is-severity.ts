import type { Severity } from './severity';
import { SEVERITY_ORDER } from './severity-order';

export function isSeverity(value: unknown): value is Severity {
  return (
    typeof value === 'string' &&
    (SEVERITY_ORDER as readonly string[]).includes(value)
  );
}
