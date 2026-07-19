import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from './validate-against-schema';

const SCHEMA = {
  type: 'object',
  required: ['verdict'],
  properties: { verdict: { type: 'string' } },
  additionalProperties: false,
};

describe('validateAgainstSchema', () => {
  it('returns no errors for a conforming value', () => {
    expect(validateAgainstSchema({ verdict: 'pass' }, SCHEMA)).toEqual([]);
  });

  it('names each violation for a non-conforming value', () => {
    const errors: readonly string[] = validateAgainstSchema(
      { unexpected: 1 },
      SCHEMA,
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join(' ')).toMatch(/verdict/);
  });

  it('reports a type mismatch on a declared property', () => {
    const errors: readonly string[] = validateAgainstSchema(
      { verdict: 42 },
      SCHEMA,
    );
    expect(errors.join(' ')).toMatch(/verdict/);
  });
});
