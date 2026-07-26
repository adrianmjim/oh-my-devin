import type { SeatArgument } from './seat-argument';
import type { TypedPosition } from './typed-position';

export function supportingArguments(
  positions: readonly TypedPosition[],
): readonly SeatArgument[] {
  return positions
    .filter(
      (position: TypedPosition): boolean => position.kind === 'preference',
    )
    .map((position: TypedPosition): SeatArgument => ({
      seat: position.seat,
      claim: position.concern,
    }));
}
