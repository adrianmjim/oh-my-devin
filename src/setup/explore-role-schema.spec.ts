import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { EXPLORE_ROLE_SCHEMA } from './explore-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  EXPLORE_ROLE_SCHEMA,
) as Record<string, unknown>;
const PROPERTIES: Record<string, unknown> = (SCHEMA['properties'] ??
  {}) as Record<string, unknown>;
const FINDINGS: Record<string, unknown> = (PROPERTIES['findings'] ??
  {}) as Record<string, unknown>;
const FINDING: Record<string, unknown> = (FINDINGS['items'] ?? {}) as Record<
  string,
  unknown
>;
const RELATIONSHIPS: Record<string, unknown> = (PROPERTIES['relationships'] ??
  {}) as Record<string, unknown>;
const NOTHING_FOUND: Record<string, unknown> = (PROPERTIES['nothingFound'] ??
  {}) as Record<string, unknown>;

const FOUND: Record<string, unknown> = {
  findings: [
    {
      path: 'src/contract/derive-approval-posture.ts',
      relevance: 'Derives the posture from an Exec allow rule alone',
    },
  ],
  relationships: [],
};

const EMPTY_HANDED: Record<string, unknown> = {
  findings: [],
  relationships: [],
  nothingFound: {
    searched: [
      'src/**/*.ts for a permission-mode argument',
      'src/engine for a fetch surface',
    ],
  },
};

describe('EXPLORE_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires the findings list to be accounted for', () => {
    expect(SCHEMA['required']).toEqual(['findings']);
    expect(FINDINGS['type']).toBe('array');
  });

  it('anchors every finding to a path and says why it matters', () => {
    expect(FINDING['required']).toEqual(['path', 'relevance']);
  });

  it('carries the relationships the caller would otherwise re-derive', () => {
    const item: Record<string, unknown> = (RELATIONSHIPS['items'] ??
      {}) as Record<string, unknown>;
    expect(RELATIONSHIPS['type']).toBe('array');
    expect(item['required']).toEqual(['from', 'to', 'relationship']);
  });

  it('makes an empty-handed result name what it searched', () => {
    const searched: Record<string, unknown> = (
      (NOTHING_FOUND['properties'] ?? {}) as Record<string, unknown>
    )['searched'] as Record<string, unknown>;
    expect(NOTHING_FOUND['required']).toEqual(['searched']);
    expect(searched['minItems']).toBe(1);
  });

  it('demands exactly one of finding something or saying it did not', () => {
    expect(SCHEMA['oneOf']).toEqual([
      { properties: { findings: { minItems: 1 } } },
      { required: ['nothingFound'] },
    ]);
  });

  it('closes both objects and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(FINDING['additionalProperties']).toBe(false);
    expect(EXPLORE_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('accepts a map that found something', () => {
    expect(validateAgainstSchema(FOUND, SCHEMA)).toEqual([]);
  });

  it('accepts an honest empty-handed search', () => {
    expect(validateAgainstSchema(EMPTY_HANDED, SCHEMA)).toEqual([]);
  });

  it('rejects a map that neither found nor admitted anything', () => {
    expect(
      validateAgainstSchema({ findings: [], relationships: [] }, SCHEMA),
    ).not.toEqual([]);
  });

  it('rejects a map that both found something and claims it did not', () => {
    expect(
      validateAgainstSchema(
        { ...FOUND, nothingFound: { searched: ['everything'] } },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a finding with no relevance to the question asked', () => {
    expect(
      validateAgainstSchema(
        { findings: [{ path: 'src/run/run-role.ts' }], relationships: [] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a finding whose path is only whitespace', () => {
    expect(
      validateAgainstSchema(
        {
          findings: [{ path: '  ', relevance: 'It matters' }],
          relationships: [],
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects an empty-handed claim that searched nothing', () => {
    expect(
      validateAgainstSchema(
        { findings: [], relationships: [], nothingFound: { searched: [] } },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('accepts a map carrying the relationships it traced', () => {
    expect(
      validateAgainstSchema(
        {
          findings: [
            {
              path: 'src/engine/devin-headless-engine.ts',
              relevance: 'Builds the turn invocation',
            },
          ],
          relationships: [
            {
              from: 'src/engine/devin-headless-engine.ts',
              to: 'src/engine/devin-permission-mode-for.ts',
              relationship: 'reads the permission mode from',
            },
          ],
        },
        SCHEMA,
      ),
    ).toEqual([]);
  });
});
