import { DeliberationError } from './deliberation-error';
import type { SeatClarification } from './seat-clarification';
import type { SeatPosition } from './seat-position';

export function requireSeatClarification(
  response: SeatPosition,
): SeatClarification {
  if (response.kind !== 'clarification') {
    throw new DeliberationError(
      `seat "${response.seat}" must emit a clarification in the clarifications phase`,
    );
  }
  return response;
}
