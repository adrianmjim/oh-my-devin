import type { CouncilSeat } from '../council/council-seat';
import { isSeverity } from '../council/severity';
import { DeliberationError } from './deliberation-error';
import type { PositionKind } from './position-kind';
import type { TypedPosition } from './typed-position';

function isPositionKind(value: unknown): value is PositionKind {
  return value === 'objection' || value === 'preference';
}

export function parseSeatPosition(
  seat: CouncilSeat,
  raw: string,
): TypedPosition {
  const fields: Record<string, unknown> = parseObject(seat, raw);

  const kind: unknown = fields['kind'];
  if (!isPositionKind(kind)) {
    throw new DeliberationError(
      `seat "${seat.role}" position.kind must be "objection" or "preference"`,
    );
  }
  const severity: unknown = fields['severity'];
  if (!isSeverity(severity)) {
    throw new DeliberationError(
      `seat "${seat.role}" position.severity must be low|medium|high|critical`,
    );
  }
  const domain: unknown = fields['domain'];
  const concern: unknown = fields['concern'];
  if (typeof domain !== 'string' || typeof concern !== 'string') {
    throw new DeliberationError(
      `seat "${seat.role}" position must carry string "domain" and "concern"`,
    );
  }

  return { seat: seat.role, lens: seat.lens, kind, domain, severity, concern };
}

function parseObject(seat: CouncilSeat, raw: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DeliberationError(`seat "${seat.role}" produced invalid JSON`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new DeliberationError(
      `seat "${seat.role}" position must be a JSON object`,
    );
  }
  return parsed as Record<string, unknown>;
}
