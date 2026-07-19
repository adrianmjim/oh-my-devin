import { describe, expect, it } from 'vitest';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { parseSeatPosition } from './parse-seat-position';
import type { TypedPosition } from './typed-position';

const SEAT: CouncilSeat = {
  role: 'security',
  lens: 'threat-model',
  proposer: false,
  contrarian: false,
  model: null,
};

function raw(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    kind: 'objection',
    domain: 'auth',
    severity: 'high',
    concern: 'token leak',
    ...overrides,
  });
}

describe('parseSeatPosition', () => {
  it('maps a valid position, carrying the seat identity and lens', () => {
    const position: TypedPosition = parseSeatPosition(SEAT, raw());
    expect(position).toEqual({
      seat: 'security',
      lens: 'threat-model',
      kind: 'objection',
      domain: 'auth',
      severity: 'high',
      concern: 'token leak',
    });
  });

  it('rejects an unknown position kind', () => {
    expect(() => parseSeatPosition(SEAT, raw({ kind: 'veto' }))).toThrow(
      DeliberationError,
    );
  });

  it('rejects an invalid severity', () => {
    expect(() => parseSeatPosition(SEAT, raw({ severity: 'urgent' }))).toThrow(
      DeliberationError,
    );
  });

  it('rejects a missing domain or concern', () => {
    expect(() => parseSeatPosition(SEAT, raw({ domain: 7 }))).toThrow(
      DeliberationError,
    );
    expect(() => parseSeatPosition(SEAT, raw({ concern: null }))).toThrow(
      DeliberationError,
    );
  });

  it('rejects malformed JSON and non-objects', () => {
    expect(() => parseSeatPosition(SEAT, 'not json')).toThrow(
      DeliberationError,
    );
    expect(() => parseSeatPosition(SEAT, '[1,2]')).toThrow(DeliberationError);
  });
});
