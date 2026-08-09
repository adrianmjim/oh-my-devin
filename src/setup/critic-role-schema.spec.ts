import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { CRITIC_ROLE_SCHEMA } from './critic-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  CRITIC_ROLE_SCHEMA,
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

const PRESENT_FLAW: Record<string, string> = {
  severity: 'high',
  category: 'present_flaw',
  location: 'docs/plan.md:12',
  summary: 'The rollout step has no rollback',
  fix: 'State the rollback command beside the rollout step',
};

const MISSING_ELEMENT: Record<string, string> = {
  severity: 'high',
  category: 'missing_element',
  absentElement: 'migration plan',
  summary: 'Nothing says how existing rows reach the new column',
  fix: 'Add a backfill step before the cutover',
};

describe('CRITIC_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires the verdict and the findings it rests on', () => {
    expect(SCHEMA['required']).toEqual(['verdict', 'findings']);
  });

  it('routes on exactly the two outcomes the layer knows', () => {
    expect(PROPERTIES['verdict']).toEqual({
      type: 'string',
      enum: ['approve', 'request_changes'],
    });
  });

  it('rates every finding on the reviewer severity scale', () => {
    expect(FINDING_PROPERTIES['severity']).toEqual({
      type: 'string',
      enum: ['critical', 'high', 'medium', 'low'],
    });
  });

  it('separates a present flaw from a missing element', () => {
    expect(FINDING_PROPERTIES['category']).toEqual({
      type: 'string',
      enum: ['present_flaw', 'missing_element'],
    });
  });

  it('requires every finding to be categorised, stated, and actionable', () => {
    expect(FINDING['required']).toEqual([
      'severity',
      'category',
      'summary',
      'fix',
    ]);
  });

  it('closes both objects and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(FINDING['additionalProperties']).toBe(false);
    expect(CRITIC_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('accepts a located present flaw and a named missing element', () => {
    expect(
      validateAgainstSchema(
        { verdict: 'request_changes', findings: [PRESENT_FLAW] },
        SCHEMA,
      ),
    ).toEqual([]);
    expect(
      validateAgainstSchema(
        { verdict: 'request_changes', findings: [MISSING_ELEMENT] },
        SCHEMA,
      ),
    ).toEqual([]);
  });

  it('rejects a present flaw that names no location', () => {
    const unlocated: Record<string, string> = { ...PRESENT_FLAW };
    delete unlocated['location'];
    expect(
      validateAgainstSchema(
        { verdict: 'request_changes', findings: [unlocated] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a missing element that names no absent element', () => {
    const unnamed: Record<string, string> = { ...MISSING_ELEMENT };
    delete unnamed['absentElement'];
    expect(
      validateAgainstSchema(
        { verdict: 'request_changes', findings: [unnamed] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a finding that states no category', () => {
    const uncategorised: Record<string, string> = { ...PRESENT_FLAW };
    delete uncategorised['category'];
    expect(
      validateAgainstSchema(
        { verdict: 'request_changes', findings: [uncategorised] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a finding whose fix is only whitespace', () => {
    expect(
      validateAgainstSchema(
        {
          verdict: 'request_changes',
          findings: [{ ...PRESENT_FLAW, fix: '   ' }],
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

  it('rejects an approval that leaves a blocker open', () => {
    for (const severity of ['critical', 'high']) {
      expect(
        validateAgainstSchema(
          {
            verdict: 'approve',
            findings: [{ ...PRESENT_FLAW, severity }],
          },
          SCHEMA,
        ),
        severity,
      ).not.toEqual([]);
    }
  });

  it('accepts an approval with nothing to report', () => {
    expect(
      validateAgainstSchema({ verdict: 'approve', findings: [] }, SCHEMA),
    ).toEqual([]);
  });

  it('accepts an approval annotated with minor findings', () => {
    for (const severity of ['medium', 'low']) {
      expect(
        validateAgainstSchema(
          { verdict: 'approve', findings: [{ ...PRESENT_FLAW, severity }] },
          SCHEMA,
        ),
        severity,
      ).toEqual([]);
    }
  });
});
