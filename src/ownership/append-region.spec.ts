import { describe, expect, it } from 'vitest';
import { appendRegion } from './append-region';

describe('appendRegion', () => {
  it('separates the appended region with a blank line', () => {
    expect(appendRegion('body\n', 'REGION')).toBe('body\n\nREGION');
  });

  it('terminates the existing content before appending', () => {
    expect(appendRegion('body', 'REGION')).toBe('body\n\nREGION');
  });
});
