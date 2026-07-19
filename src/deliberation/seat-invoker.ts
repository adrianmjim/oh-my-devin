import type { SeatInvocation } from './seat-invocation';
import type { SeatPosition } from './seat-position';

export type SeatInvoker = (
  invocations: readonly SeatInvocation[],
) => Promise<readonly SeatPosition[]>;
