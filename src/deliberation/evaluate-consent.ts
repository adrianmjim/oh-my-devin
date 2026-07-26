import type { Severity } from '../council/severity';
import type { ConsentResult } from './consent-result';
import { isBlockingPosition } from './is-blocking-position';
import type { TypedPosition } from './typed-position';

export function evaluateConsent(
  positions: readonly TypedPosition[],
  threshold: Severity,
): ConsentResult {
  const blocking: readonly TypedPosition[] = positions.filter(
    (position: TypedPosition): boolean =>
      isBlockingPosition(position, threshold),
  );
  return { consented: blocking.length === 0, blocking };
}
