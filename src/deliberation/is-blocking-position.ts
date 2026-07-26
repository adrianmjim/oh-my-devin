import type { Severity } from '../council/severity';
import { severityAtLeast } from '../council/severity-at-least';
import { domainWithinLens } from './domain-within-lens';
import type { TypedPosition } from './typed-position';

export function isBlockingPosition(
  position: TypedPosition,
  threshold: Severity,
): boolean {
  if (position.kind !== 'objection') {
    return false;
  }
  if (!severityAtLeast(position.severity, threshold)) {
    return false;
  }
  return domainWithinLens(position.domain, position.lens);
}
