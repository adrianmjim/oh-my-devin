import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { REVIEWER_ROLE_SCHEMA } from './reviewer-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  REVIEWER_ROLE_SCHEMA,
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

describe('REVIEWER_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires the verdict and the findings it rests on', () => {
    expect(SCHEMA['required']).toEqual(['verdict', 'findings']);
  });

  it('routes on exactly the two outcomes the pipeline knows', () => {
    expect(PROPERTIES['verdict']).toEqual({
      type: 'string',
      enum: ['approve', 'request_changes'],
    });
  });

  it('accepts an empty findings list alongside an approval', () => {
    expect(FINDINGS['type']).toBe('array');
    expect(FINDINGS['minItems']).toBeUndefined();
  });

  it('rates every finding on the severity scale', () => {
    expect(FINDING_PROPERTIES['severity']).toEqual({
      type: 'string',
      enum: ['critical', 'high', 'medium', 'low'],
    });
  });

  it('requires every finding to be located, stated, and actionable', () => {
    expect(FINDING['type']).toBe('object');
    expect(FINDING['required']).toEqual([
      'severity',
      'location',
      'summary',
      'fix',
    ]);
    for (const field of ['location', 'summary', 'fix']) {
      expect(FINDING_PROPERTIES[field], field).toEqual({
        type: 'string',
        minLength: 1,
      });
    }
  });

  it('keeps the notes optional', () => {
    expect(PROPERTIES['notes']).toEqual({ type: 'string' });
    expect(SCHEMA['required']).not.toContain('notes');
  });

  it('closes both objects and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(FINDING['additionalProperties']).toBe(false);
    expect(REVIEWER_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('rejects the reviews that satisfied only the pre-uplift shape', () => {
    expect(validateAgainstSchema({ verdict: 'approve' }, SCHEMA)).not.toEqual(
      [],
    );
    expect(
      validateAgainstSchema(
        {
          verdict: 'request_changes',
          findings: [{ location: 'a.ts', summary: 's', fix: 'f' }],
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
    expect(
      validateAgainstSchema(
        {
          verdict: 'request_changes',
          findings: [{ severity: 'high', location: 'a.ts', summary: 's' }],
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a verdict the pipeline cannot route on', () => {
    expect(
      validateAgainstSchema({ verdict: 'lgtm', findings: [] }, SCHEMA),
    ).not.toEqual([]);
  });

  it('accepts an approval with nothing to report', () => {
    expect(
      validateAgainstSchema({ verdict: 'approve', findings: [] }, SCHEMA),
    ).toEqual([]);
  });

  it('accepts a rated finding with a concrete fix', () => {
    expect(
      validateAgainstSchema(
        {
          verdict: 'request_changes',
          findings: [
            {
              severity: 'critical',
              location: 'src/role/parse-role-definition.ts:96',
              summary: 'A malformed duration aborts the run unlabelled',
              fix: 'Fail through the role error path',
            },
          ],
        },
        SCHEMA,
      ),
    ).toEqual([]);
  });
});
