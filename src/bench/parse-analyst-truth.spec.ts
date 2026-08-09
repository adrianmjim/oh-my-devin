import { describe, expect, it } from 'vitest';
import type { AnalystTruthDocument } from './analyst-truth-document';
import { BenchFixtureError } from './bench-fixture-error';
import { parseAnalystTruth } from './parse-analyst-truth';

const VALID: Record<string, unknown> = {
  role: 'analyst',
  gaps: [
    { id: 'size-zero', keywords: ['size', 'zero'], surface: 'criterion' },
    { id: 'who-owns', keywords: ['owner', 'retention'], surface: 'question' },
    { id: 'creep', keywords: ['filter', 'reporting'], surface: 'risk' },
  ],
};

describe('parseAnalystTruth', () => {
  it('reads a well-formed analyst truth document', () => {
    const truth: AnalystTruthDocument = parseAnalystTruth(VALID, 'truth.json');

    expect(truth.role).toBe('analyst');
    expect(truth.gaps).toHaveLength(3);
    expect(truth.gaps[0]?.surface).toBe('criterion');
    expect(truth.gaps[2]?.surface).toBe('risk');
  });

  it('rejects gaps that are not a list', () => {
    expect(() =>
      parseAnalystTruth({ role: 'analyst', gaps: {} }, 'truth.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a gap naming no surface', () => {
    expect(() =>
      parseAnalystTruth(
        { role: 'analyst', gaps: [{ id: 'a', keywords: ['k'] }] },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a surface outside the four lists', () => {
    expect(() =>
      parseAnalystTruth(
        {
          role: 'analyst',
          gaps: [{ id: 'a', keywords: ['k'], surface: 'note' }],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a gap with no keywords to pair on', () => {
    expect(() =>
      parseAnalystTruth(
        {
          role: 'analyst',
          gaps: [{ id: 'a', keywords: [], surface: 'criterion' }],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('accepts a clean fixture with no planted gap', () => {
    expect(
      parseAnalystTruth({ role: 'analyst', gaps: [] }, 'truth.json').gaps,
    ).toEqual([]);
  });
});
