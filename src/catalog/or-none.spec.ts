import { describe, expect, it } from 'vitest';
import { orNone } from './or-none';

describe('orNone', () => {
  it('joins the values with commas', () => {
    expect(orNone(['read', 'grep'])).toBe('read, grep');
  });

  it('reads as none when there are no values', () => {
    expect(orNone([])).toBe('(none)');
  });
});
