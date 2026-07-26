import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { isStringArray } from './is-string-array';

export function parseOptionalStrings(
  seat: CouncilSeat,
  fields: Record<string, unknown>,
  name: string,
): readonly string[] {
  const value: unknown = fields[name];
  if (value === undefined) {
    return [];
  }
  if (!isStringArray(value)) {
    throw new DeliberationError(
      `seat "${seat.id}" position.${name} must be a string array`,
    );
  }
  return value;
}
