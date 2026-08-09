import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { CriticTruthDocument } from './critic-truth-document';
import { parseCriticTruth } from './parse-critic-truth';

const VALID: Record<string, unknown> = {
  role: 'critic',
  expectedVerdict: 'request_changes',
  findings: [
    {
      id: 'no-rollback',
      keywords: ['rollback', 'cutover'],
      severity: 'high',
      category: 'missing_element',
    },
    {
      id: 'wrong-order',
      keywords: ['backfill', 'before'],
      severity: 'medium',
      category: 'present_flaw',
    },
  ],
};

describe('parseCriticTruth', () => {
  it('reads a well-formed critic truth document', () => {
    const truth: CriticTruthDocument = parseCriticTruth(VALID, 'truth.json');

    expect(truth.role).toBe('critic');
    expect(truth.expectedVerdict).toBe('request_changes');
    expect(truth.findings).toHaveLength(2);
    expect(truth.findings[0]?.category).toBe('missing_element');
    expect(truth.findings[1]?.category).toBe('present_flaw');
  });

  it('rejects a verdict the layer cannot route on', () => {
    expect(() =>
      parseCriticTruth({ ...VALID, expectedVerdict: 'lgtm' }, 'truth.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects findings that are not a list', () => {
    expect(() =>
      parseCriticTruth({ ...VALID, findings: {} }, 'truth.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a truth item with no category', () => {
    expect(() =>
      parseCriticTruth(
        {
          ...VALID,
          findings: [
            { id: 'a', keywords: ['k'], severity: 'high' },
          ],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a category outside the two the critique knows', () => {
    expect(() =>
      parseCriticTruth(
        {
          ...VALID,
          findings: [
            { id: 'a', keywords: ['k'], severity: 'high', category: 'other' },
          ],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a truth item with no keywords to pair on', () => {
    expect(() =>
      parseCriticTruth(
        {
          ...VALID,
          findings: [
            {
              id: 'a',
              keywords: [],
              severity: 'high',
              category: 'present_flaw',
            },
          ],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a severity outside the reviewer ladder', () => {
    expect(() =>
      parseCriticTruth(
        {
          ...VALID,
          findings: [
            {
              id: 'a',
              keywords: ['k'],
              severity: 'blocker',
              category: 'present_flaw',
            },
          ],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('accepts an empty findings list beside an approving verdict', () => {
    const truth: CriticTruthDocument = parseCriticTruth(
      { role: 'critic', expectedVerdict: 'approve', findings: [] },
      'truth.json',
    );

    expect(truth.findings).toEqual([]);
  });
});
