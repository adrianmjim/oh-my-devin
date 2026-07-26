import { describe, expect, it } from 'vitest';
import { WRITE_VERB } from './write-verb';

describe('WRITE_VERB', () => {
  it('names the permission verb that grants writing', () => {
    expect(WRITE_VERB).toBe('Write');
  });
});
