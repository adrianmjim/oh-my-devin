import type { SeatArgument } from './seat-argument';

export function requireSeatArgument(
  argument: SeatArgument | undefined,
): SeatArgument {
  if (argument === undefined) {
    throw new Error('echo cluster member vanished');
  }
  return argument;
}
