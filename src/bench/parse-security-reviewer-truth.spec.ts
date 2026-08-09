import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { parseSecurityReviewerTruth } from './parse-security-reviewer-truth';
import type { SecurityReviewerTruthDocument } from './security-reviewer-truth-document';

const VALID: Record<string, unknown> = {
  role: 'security-reviewer',
  expectedVerdict: 'request_changes',
  vulnerabilities: [
    {
      id: 'shell-injection',
      keywords: ['shell', 'interpolat', 'argv'],
      severity: 'critical',
    },
  ],
};

describe('parseSecurityReviewerTruth', () => {
  it('reads a well-formed security truth document', () => {
    const truth: SecurityReviewerTruthDocument = parseSecurityReviewerTruth(
      VALID,
      'truth.json',
    );

    expect(truth.role).toBe('security-reviewer');
    expect(truth.expectedVerdict).toBe('request_changes');
    expect(truth.vulnerabilities[0]?.severity).toBe('critical');
  });

  it('rejects a verdict the layer cannot route on', () => {
    expect(() =>
      parseSecurityReviewerTruth(
        { ...VALID, expectedVerdict: 'ship_it' },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects vulnerabilities that are not a list', () => {
    expect(() =>
      parseSecurityReviewerTruth(
        { ...VALID, vulnerabilities: null },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a severity outside the ladder', () => {
    expect(() =>
      parseSecurityReviewerTruth(
        {
          ...VALID,
          vulnerabilities: [{ id: 'a', keywords: ['k'], severity: 'sev1' }],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('accepts a clean fixture with no planted vulnerability', () => {
    expect(
      parseSecurityReviewerTruth(
        {
          role: 'security-reviewer',
          expectedVerdict: 'approve',
          vulnerabilities: [],
        },
        'truth.json',
      ).vulnerabilities,
    ).toEqual([]);
  });
});
