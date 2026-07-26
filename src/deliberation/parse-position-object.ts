import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';

export function parsePositionObject(
  seat: CouncilSeat,
  raw: string,
): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DeliberationError(`seat "${seat.id}" produced invalid JSON`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new DeliberationError(
      `seat "${seat.id}" position must be a JSON object`,
    );
  }
  return parsed as Record<string, unknown>;
}
