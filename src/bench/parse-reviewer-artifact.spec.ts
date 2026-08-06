import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { parseReviewerArtifact } from './parse-reviewer-artifact';
import type { ReviewerArtifact } from './reviewer-artifact';

describe('parseReviewerArtifact', () => {
  it('narrows a schema-valid review to the typed artifact', () => {
    const artifact: ReviewerArtifact = parseReviewerArtifact(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            location: 'src/parse.js:12',
            summary: 'the loop never terminates',
            fix: 'bound the iteration',
          },
        ],
        notes: 'ignored by the bench',
      },
      'review.json',
    );

    expect(artifact.verdict).toBe('request_changes');
    expect(artifact.findings[0]?.location).toBe('src/parse.js:12');
  });

  it('accepts an approval with no findings', () => {
    expect(
      parseReviewerArtifact({ verdict: 'approve', findings: [] }, 'review.json')
        .findings,
    ).toEqual([]);
  });

  it('rejects an unknown verdict, naming the source', () => {
    expect(() =>
      parseReviewerArtifact({ verdict: 'lgtm', findings: [] }, 'review.json'),
    ).toThrow(BenchFixtureError);
    expect(() =>
      parseReviewerArtifact({ verdict: 'lgtm', findings: [] }, 'review.json'),
    ).toThrow('review.json');
  });

  it('rejects a finding missing a schema-required field', () => {
    expect(() =>
      parseReviewerArtifact(
        {
          verdict: 'request_changes',
          findings: [{ severity: 'high', location: 'a', summary: 'b' }],
        },
        'review.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
