import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { isStringArray } from './is-string-array';
import type { SeatPosition } from './seat-position';

export function parseSeatClarification(
  seat: CouncilSeat,
  fields: Record<string, unknown>,
): SeatPosition {
  const questions: unknown = fields['questions'];
  if (!isStringArray(questions)) {
    throw new DeliberationError(
      `seat "${seat.id}" clarification must carry a string array "questions"`,
    );
  }
  return {
    seat: seat.id,
    lens: seat.lens,
    kind: 'clarification',
    questions,
  };
}
