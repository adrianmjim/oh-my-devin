import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { DEBUGGER_ROLE_SCHEMA } from './debugger-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  DEBUGGER_ROLE_SCHEMA,
) as Record<string, unknown>;
const PROPERTIES: Record<string, unknown> = (SCHEMA['properties'] ??
  {}) as Record<string, unknown>;
const EVIDENCE: Record<string, unknown> = (PROPERTIES['evidence'] ??
  {}) as Record<string, unknown>;
const ROOT_CAUSE: Record<string, unknown> = (PROPERTIES['rootCause'] ??
  {}) as Record<string, unknown>;
const NOT_ISOLATED: Record<string, unknown> = (PROPERTIES['notIsolated'] ??
  {}) as Record<string, unknown>;

const EVIDENCE_SAMPLE: readonly Record<string, string>[] = [
  {
    source: 'pnpm vitest run src/run/run-role.spec.ts',
    observation: 'The resume path throws before the artifact is read',
  },
];

const ISOLATED: Record<string, unknown> = {
  evidence: EVIDENCE_SAMPLE,
  rootCause: {
    location: 'src/run/run-role.ts:88',
    explanation: 'The session id is read before the resume branch assigns it',
    fixDirection: 'Assign the id in both branches before the read',
  },
};

const UNRESOLVED: Record<string, unknown> = {
  evidence: EVIDENCE_SAMPLE,
  notIsolated: {
    eliminatedHypotheses: [
      'A stale build: the failure reproduces after a clean rebuild',
      'Test pollution: the case fails when run alone',
    ],
  },
};

describe('DEBUGGER_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires the evidence a diagnosis rests on', () => {
    expect(SCHEMA['required']).toEqual(['evidence']);
    expect(EVIDENCE['type']).toBe('array');
    expect(EVIDENCE['minItems']).toBe(1);
  });

  it('makes every evidence entry traceable to what produced it', () => {
    const item: Record<string, unknown> = (EVIDENCE['items'] ?? {}) as Record<
      string,
      unknown
    >;
    expect(item['required']).toEqual(['source', 'observation']);
  });

  it('makes an isolated cause located, explained, and actionable', () => {
    expect(ROOT_CAUSE['required']).toEqual([
      'location',
      'explanation',
      'fixDirection',
    ]);
  });

  it('makes a not-isolated statement name what it eliminated', () => {
    const hypotheses: Record<string, unknown> = (
      (NOT_ISOLATED['properties'] ?? {}) as Record<string, unknown>
    )['eliminatedHypotheses'] as Record<string, unknown>;
    expect(NOT_ISOLATED['required']).toEqual(['eliminatedHypotheses']);
    expect(hypotheses['minItems']).toBe(1);
  });

  it('demands exactly one of the two honest outcomes', () => {
    expect(SCHEMA['oneOf']).toEqual([
      { required: ['rootCause'] },
      { required: ['notIsolated'] },
    ]);
  });

  it('closes the object and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(DEBUGGER_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('accepts an isolated root cause', () => {
    expect(validateAgainstSchema(ISOLATED, SCHEMA)).toEqual([]);
  });

  it('accepts an honest failure to isolate', () => {
    expect(validateAgainstSchema(UNRESOLVED, SCHEMA)).toEqual([]);
  });

  it('rejects a diagnosis that reaches neither outcome', () => {
    expect(
      validateAgainstSchema({ evidence: EVIDENCE_SAMPLE }, SCHEMA),
    ).not.toEqual([]);
  });

  it('rejects a diagnosis claiming both outcomes at once', () => {
    expect(
      validateAgainstSchema({ ...ISOLATED, ...UNRESOLVED }, SCHEMA),
    ).not.toEqual([]);
  });

  it('rejects a diagnosis resting on no evidence', () => {
    expect(
      validateAgainstSchema({ ...ISOLATED, evidence: [] }, SCHEMA),
    ).not.toEqual([]);
  });

  it('rejects a root cause with no fix direction', () => {
    expect(
      validateAgainstSchema(
        {
          evidence: EVIDENCE_SAMPLE,
          rootCause: {
            location: 'src/run/run-role.ts:88',
            explanation: 'The session id is read too early',
          },
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a not-isolated statement that eliminated nothing', () => {
    expect(
      validateAgainstSchema(
        {
          evidence: EVIDENCE_SAMPLE,
          notIsolated: { eliminatedHypotheses: [] },
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects an evidence entry that names no source', () => {
    expect(
      validateAgainstSchema(
        {
          ...ISOLATED,
          evidence: [{ observation: 'It fails sometimes' }],
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });
});
