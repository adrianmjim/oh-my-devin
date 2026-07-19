import { describe, expect, it } from 'vitest';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { parseSeatPosition } from './parse-seat-position';
import type { SeatPosition } from './seat-position';

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
    const position: SeatPosition = parseSeatPosition(SEAT, raw());
    expect(position).toEqual({
      seat: 'security',
      lens: 'threat-model',
      kind: 'objection',
      domain: 'auth',
      severity: 'high',
      concern: 'token leak',
      assumptions: [],
      reconsiderWhen: [],
    });
  });

  it('extracts declared assumptions and reconsider_when triggers', () => {
    const position: SeatPosition = parseSeatPosition(
      SEAT,
      raw({
        assumptions: ['tokens_are_short_lived'],
        reconsider_when: ['token_ttl_grows'],
      }),
    );
    expect(position.kind).toBe('objection');
    if (position.kind !== 'clarification') {
      expect(position.assumptions).toEqual(['tokens_are_short_lived']);
      expect(position.reconsiderWhen).toEqual(['token_ttl_grows']);
    }
  });

  it('rejects non-string-array assumptions or reconsider_when', () => {
    expect(() => parseSeatPosition(SEAT, raw({ assumptions: 'x' }))).toThrow(
      DeliberationError,
    );
    expect(() =>
      parseSeatPosition(SEAT, raw({ reconsider_when: [7] })),
    ).toThrow(DeliberationError);
  });

  it('maps a clarification with its questions', () => {
    const position: SeatPosition = parseSeatPosition(
      SEAT,
      JSON.stringify({
        kind: 'clarification',
        questions: ['what is the rollout plan?'],
      }),
    );
    expect(position).toEqual({
      seat: 'security',
      lens: 'threat-model',
      kind: 'clarification',
      questions: ['what is the rollout plan?'],
    });
  });

  it('accepts a clarification with no questions', () => {
    const position: SeatPosition = parseSeatPosition(
      SEAT,
      JSON.stringify({ kind: 'clarification', questions: [] }),
    );
    expect(position.kind).toBe('clarification');
    if (position.kind === 'clarification') {
      expect(position.questions).toEqual([]);
    }
  });

  it('rejects a clarification without a string-array of questions', () => {
    expect(() =>
      parseSeatPosition(SEAT, JSON.stringify({ kind: 'clarification' })),
    ).toThrow(DeliberationError);
    expect(() =>
      parseSeatPosition(
        SEAT,
        JSON.stringify({ kind: 'clarification', questions: [1] }),
      ),
    ).toThrow(DeliberationError);
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
