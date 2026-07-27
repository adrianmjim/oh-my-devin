import { describe, expect, it } from 'vitest';
import { arrayItemSchema } from './array-item-schema';

const SOURCE: string = JSON.stringify({
  type: 'object',
  properties: {
    steps: {
      type: 'array',
      items: { type: 'object', required: ['description'] },
    },
  },
});

describe('arrayItemSchema', () => {
  it('extracts the item schema of the named array property', () => {
    expect(arrayItemSchema(SOURCE, 'steps')).toEqual({
      type: 'object',
      required: ['description'],
    });
  });
});
