import type { AnonymizedArgument } from './anonymized-argument';
import type { TypedPosition } from './typed-position';

export function relayAnonymized(
  positions: readonly TypedPosition[],
): readonly AnonymizedArgument[] {
  return positions.map((position: TypedPosition): AnonymizedArgument => ({
    kind: position.kind,
    domain: position.domain,
    severity: position.severity,
    concern: position.concern,
  }));
}
