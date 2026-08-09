import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { parseSecurityReviewerArtifact } from './parse-security-reviewer-artifact';
import type { ReviewerArtifact } from './reviewer-artifact';

describe('parseSecurityReviewerArtifact', () => {
  it('reads the category and remediation into pairable text', () => {
    const artifact: ReviewerArtifact = parseSecurityReviewerArtifact(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'critical',
            category: 'A03:2021 Injection',
            location: 'src/run/build-command.ts:41',
            remediation: 'Pass the role name as an argv element',
          },
        ],
      },
      'sample.json',
    );

    expect(artifact.verdict).toBe('request_changes');
    expect(artifact.findings[0]?.location).toBe(
      'src/run/build-command.ts:41',
    );
    expect(artifact.findings[0]?.summary).toContain('Injection');
    expect(artifact.findings[0]?.fix).toContain('argv');
  });

  it('reads a clean review', () => {
    expect(
      parseSecurityReviewerArtifact(
        { verdict: 'approve', findings: [] },
        'sample.json',
      ).findings,
    ).toEqual([]);
  });

  it('rejects a finding with no remediation', () => {
    expect(() =>
      parseSecurityReviewerArtifact(
        {
          verdict: 'request_changes',
          findings: [
            { severity: 'high', category: 'Injection', location: 'a.ts:1' },
          ],
        },
        'sample.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a verdict the layer cannot route on', () => {
    expect(() =>
      parseSecurityReviewerArtifact(
        { verdict: 'maybe', findings: [] },
        'sample.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
