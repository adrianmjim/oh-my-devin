import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { ARCHITECT_ROLE_SCHEMA } from './architect-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  ARCHITECT_ROLE_SCHEMA,
) as Record<string, unknown>;
const PROPERTIES: Record<string, unknown> = SCHEMA['properties'] as Record<
  string,
  unknown
>;
const STEPS: Record<string, unknown> = PROPERTIES['steps'] as Record<
  string,
  unknown
>;
const STEP: Record<string, unknown> = STEPS['items'] as Record<string, unknown>;

describe('ARCHITECT_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires both the approach and the steps it decomposes into', () => {
    expect(SCHEMA['required']).toEqual(['approach', 'steps']);
  });

  it('rejects an empty approach', () => {
    expect(PROPERTIES['approach']).toEqual({ type: 'string', minLength: 1 });
  });

  it('requires at least one step', () => {
    expect(STEPS['type']).toBe('array');
    expect(STEPS['minItems']).toBe(1);
  });

  it('requires every step to describe a concrete change', () => {
    expect(STEP['type']).toBe('object');
    expect(STEP['required']).toEqual(['description']);
    expect(
      (STEP['properties'] as Record<string, unknown>)['description'],
    ).toEqual({ type: 'string', minLength: 1 });
  });

  it('lets a step name the files it touches', () => {
    expect((STEP['properties'] as Record<string, unknown>)['files']).toEqual({
      type: 'array',
      items: { type: 'string' },
    });
    expect(STEP['additionalProperties']).toBe(false);
  });

  it('keeps the risks optional', () => {
    expect(PROPERTIES['risks']).toEqual({
      type: 'array',
      items: { type: 'string' },
    });
    expect(SCHEMA['required']).not.toContain('risks');
  });

  it('closes the object and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(ARCHITECT_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('rejects the architectures that satisfied only the pre-uplift shape', () => {
    expect(
      validateAgainstSchema({ approach: 'Rewrite it' }, SCHEMA),
    ).not.toEqual([]);
    expect(
      validateAgainstSchema({ approach: 'a', steps: [] }, SCHEMA),
    ).not.toEqual([]);
    expect(
      validateAgainstSchema({ approach: 'a', steps: ['a step'] }, SCHEMA),
    ).not.toEqual([]);
    expect(
      validateAgainstSchema(
        { approach: 'a', steps: [{ files: ['x.ts'] }] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('accepts an architecture a step can be executed from', () => {
    expect(
      validateAgainstSchema(
        {
          approach: 'Thread the value through the parser',
          steps: [{ description: 'Parse it', files: ['x.ts'] }],
          risks: ['The caller may pass a duration'],
        },
        SCHEMA,
      ),
    ).toEqual([]);
  });
});
