import { DeliberationError } from './deliberation-error';
import type { SeatPosition } from './seat-position';
import type { TypedPosition } from './typed-position';

export function requireTypedPosition(response: SeatPosition): TypedPosition {
  if (response.kind === 'clarification') {
    throw new DeliberationError(
      `seat "${response.seat}" must emit a typed position in the objection phase`,
    );
  }
  return response;
}
