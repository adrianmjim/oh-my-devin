import type { SeatInvocation } from './seat-invocation';
import type { TypedPosition } from './typed-position';

export type SeatInvoker = (
  invocation: SeatInvocation,
) => Promise<TypedPosition>;
