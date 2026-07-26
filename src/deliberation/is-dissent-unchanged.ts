import type { TypedPosition } from './typed-position';

export function isDissentUnchanged(
  current: readonly TypedPosition[],
  previous: readonly TypedPosition[],
): boolean {
  if (previous.length === 0) {
    return false;
  }
  return current.some((now: TypedPosition): boolean =>
    previous.some(
      (before: TypedPosition): boolean =>
        before.seat === now.seat && before.domain === now.domain,
    ),
  );
}
