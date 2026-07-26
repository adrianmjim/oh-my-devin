import type { TypedPosition } from './typed-position';

export function renderBlockingObjections(
  blocking: readonly TypedPosition[],
): string {
  if (blocking.length === 0) {
    return '(none)';
  }
  return blocking
    .map(
      (position: TypedPosition): string =>
        `- [${position.severity}] ${position.domain}: ${position.concern}`,
    )
    .join('\n');
}
