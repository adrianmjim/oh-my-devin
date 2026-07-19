import type { CouncilSeat } from '../council/council-seat';
import { isSeverity } from '../council/severity';
import { DeliberationError } from './deliberation-error';
import type { PositionKind } from './position-kind';
import type { SeatPosition } from './seat-position';

function isPositionKind(value: unknown): value is PositionKind {
  return value === 'objection' || value === 'preference';
}

function isStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.every((entry: unknown): boolean => typeof entry === 'string')
  );
}

export function parseSeatPosition(
  seat: CouncilSeat,
  raw: string,
): SeatPosition {
  const fields: Record<string, unknown> = parseObject(seat, raw);

  const kind: unknown = fields['kind'];
  if (kind === 'clarification') {
    return parseClarification(seat, fields);
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

function parseClarification(
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

function parseOptionalStrings(
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

function parseObject(seat: CouncilSeat, raw: string): Record<string, unknown> {
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
