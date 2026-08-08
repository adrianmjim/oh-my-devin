import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { SECURITY_REVIEWER_ROLE_SCHEMA } from './security-reviewer-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  SECURITY_REVIEWER_ROLE_SCHEMA,
) as Record<string, unknown>;
const PROPERTIES: Record<string, unknown> = (SCHEMA['properties'] ??
  {}) as Record<string, unknown>;
const FINDINGS: Record<string, unknown> = (PROPERTIES['findings'] ??
  {}) as Record<string, unknown>;
const FINDING: Record<string, unknown> = (FINDINGS['items'] ?? {}) as Record<
  string,
  unknown
>;
const FINDING_PROPERTIES: Record<string, unknown> = (FINDING['properties'] ??
  {}) as Record<string, unknown>;

const FINDING_SAMPLE: Record<string, string> = {
  severity: 'critical',
  category: 'A03:2021 Injection',
  location: 'src/run/build-prompt.ts:41',
  remediation: 'Pass the role name as an argument instead of interpolating it',
};

describe('SECURITY_REVIEWER_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires the verdict and the findings it rests on', () => {
    expect(SCHEMA['required']).toEqual(['verdict', 'findings']);
  });

  it('reuses the reviewer verdict vocabulary', () => {
    expect(PROPERTIES['verdict']).toEqual({
      type: 'string',
      enum: ['approve', 'request_changes'],
    });
  });

  it('reuses the reviewer severity ladder', () => {
    expect(FINDING_PROPERTIES['severity']).toEqual({
      type: 'string',
      enum: ['critical', 'high', 'medium', 'low'],
    });
  });

  it('requires each finding to be categorised, located, and remediable', () => {
    expect(FINDING['required']).toEqual([
      'severity',
      'category',
      'location',
      'remediation',
    ]);
  });

  it('closes both objects and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(FINDING['additionalProperties']).toBe(false);
    expect(SECURITY_REVIEWER_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('accepts a categorised, located, remediable finding', () => {
    expect(
      validateAgainstSchema(
        { verdict: 'request_changes', findings: [FINDING_SAMPLE] },
        SCHEMA,
      ),
    ).toEqual([]);
  });

  it('rejects a finding missing any of its four parts', () => {
    for (const field of [
      'severity',
      'category',
      'location',
      'remediation',
    ] as const) {
      const partial: Record<string, string> = Object.fromEntries(
        Object.entries(FINDING_SAMPLE).filter(
          ([key]: readonly [string, string]): boolean => key !== field,
        ),
      );
      expect(
        validateAgainstSchema(
          { verdict: 'request_changes', findings: [partial] },
          SCHEMA,
        ),
        field,
      ).not.toEqual([]);
    }
  });

  it('rejects a remediation that is only whitespace', () => {
    expect(
      validateAgainstSchema(
        {
          verdict: 'request_changes',
          findings: [{ ...FINDING_SAMPLE, remediation: '   ' }],
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a rejection that states no finding', () => {
    expect(
      validateAgainstSchema(
        { verdict: 'request_changes', findings: [] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects an approval that leaves a vulnerability open', () => {
    for (const severity of ['critical', 'high']) {
      expect(
        validateAgainstSchema(
          {
            verdict: 'approve',
            findings: [{ ...FINDING_SAMPLE, severity }],
          },
          SCHEMA,
        ),
        severity,
      ).not.toEqual([]);
    }
  });

  it('accepts a clean review', () => {
    expect(
      validateAgainstSchema({ verdict: 'approve', findings: [] }, SCHEMA),
    ).toEqual([]);
  });

  it('accepts an approval annotated with minor findings', () => {
    for (const severity of ['medium', 'low']) {
      expect(
        validateAgainstSchema(
          { verdict: 'approve', findings: [{ ...FINDING_SAMPLE, severity }] },
          SCHEMA,
        ),
        severity,
      ).toEqual([]);
    }
  });
});
