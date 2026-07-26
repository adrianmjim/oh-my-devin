import { describe, expect, it } from 'vitest';
import { REVIEWER_ROLE_SCHEMA } from './reviewer-role-schema';

describe('REVIEWER_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    const schema: Record<string, unknown> = JSON.parse(
      REVIEWER_ROLE_SCHEMA,
    ) as Record<string, unknown>;

    expect(schema['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(schema['type']).toBe('object');
  });

  it('requires the verdict the reviewer must produce', () => {
    const schema: Record<string, unknown> = JSON.parse(
      REVIEWER_ROLE_SCHEMA,
    ) as Record<string, unknown>;

    expect(schema['required']).toEqual(['verdict']);
  });

  it('closes the object and ends with a newline', () => {
    const schema: Record<string, unknown> = JSON.parse(
      REVIEWER_ROLE_SCHEMA,
    ) as Record<string, unknown>;

    expect(schema['additionalProperties']).toBe(false);
    expect(REVIEWER_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });
});
