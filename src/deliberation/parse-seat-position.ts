import type { CouncilSeat } from '../council/council-seat';
import { isSeverity } from '../council/is-severity';
import { DeliberationError } from './deliberation-error';
import { isPositionKind } from './is-position-kind';
import { parseOptionalStrings } from './parse-optional-strings';
import { parsePositionObject } from './parse-position-object';
import { parseSeatClarification } from './parse-seat-clarification';
import type { SeatPosition } from './seat-position';

export function parseSeatPosition(
  seat: CouncilSeat,
  raw: string,
): SeatPosition {
  const fields: Record<string, unknown> = parsePositionObject(seat, raw);

  const kind: unknown = fields['kind'];
  if (kind === 'clarification') {
    return parseSeatClarification(seat, fields);
  }
  if (!isPositionKind(kind)) {
    throw new DeliberationError(
      `seat "${seat.id}" position.kind must be "objection", "preference", or "clarification"`,
    );
  }
  const severity: unknown = fields['severity'];
  if (!isSeverity(severity)) {
    throw new DeliberationError(
      `seat "${seat.id}" position.severity must be low|medium|high|critical`,
    );
  }
  const domain: unknown = fields['domain'];
  const concern: unknown = fields['concern'];
  if (typeof domain !== 'string' || typeof concern !== 'string') {
    throw new DeliberationError(
      `seat "${seat.id}" position must carry string "domain" and "concern"`,
    );
  }

  return {
    seat: seat.id,
    lens: seat.lens,
    kind,
    domain,
    severity,
    concern,
    assumptions: parseOptionalStrings(seat, fields, 'assumptions'),
    reconsiderWhen: parseOptionalStrings(seat, fields, 'reconsider_when'),
  };
}
