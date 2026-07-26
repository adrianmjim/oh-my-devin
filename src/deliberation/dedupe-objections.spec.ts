import { describe, expect, it } from 'vitest';
import { dedupeObjections } from './dedupe-objections';
import type { RecordedObjection } from './recorded-objection';

const OBJECTION: RecordedObjection = {
  seat: 'security',
  domain: 'auth',
  severity: 'high',
  concern: 'leak',
};

describe('dedupeObjections', () => {
  it('keeps a single copy of an identical objection', () => {
    expect(dedupeObjections([OBJECTION, { ...OBJECTION }])).toEqual([
      OBJECTION,
    ]);
  });

  it('keeps objections that differ in any field', () => {
    const other: RecordedObjection = { ...OBJECTION, concern: 'other' };

    expect(dedupeObjections([OBJECTION, other])).toEqual([OBJECTION, other]);
  });

  it('preserves the order of first appearance', () => {
    const first: RecordedObjection = { ...OBJECTION, seat: 'a' };
    const second: RecordedObjection = { ...OBJECTION, seat: 'b' };

    expect(dedupeObjections([first, second, first])).toEqual([first, second]);
  });
});
