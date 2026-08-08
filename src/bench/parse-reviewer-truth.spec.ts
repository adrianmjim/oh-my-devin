import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { parseReviewerTruth } from './parse-reviewer-truth';
import type { ReviewerTruthDocument } from './reviewer-truth-document';

describe('parseReviewerTruth', () => {
  it('parses the verdict and every defect', () => {
    const document: ReviewerTruthDocument = parseReviewerTruth(
      {
        expectedVerdict: 'request_changes',
        defects: [
          { id: 'unchecked-index', keywords: ['index', 'bounds'], severity: 'high' },
        ],
      },
      'reviewer/off-by-one/truth.json',
    );

    expect(document.role).toBe('reviewer');
    expect(document.expectedVerdict).toBe('request_changes');
    expect(document.defects).toEqual([
      { id: 'unchecked-index', keywords: ['index', 'bounds'], severity: 'high' },
    ]);
  });

  it('rejects an unknown verdict', () => {
    expect(() =>
      parseReviewerTruth({ expectedVerdict: 'reject', defects: [] }, 'x'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a non-array defects field', () => {
    expect(() =>
      parseReviewerTruth({ expectedVerdict: 'approve', defects: {} }, 'x'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a defect whose severity is outside the schema enum', () => {
    expect(() =>
      parseReviewerTruth(
        {
          expectedVerdict: 'request_changes',
          defects: [{ id: 'a', keywords: ['a'], severity: 'blocker' }],
        },
        'x',
      ),
    ).toThrow(/severity/);
  });
});
