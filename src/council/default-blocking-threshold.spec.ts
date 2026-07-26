import { describe, expect, it } from 'vitest';
import { DEFAULT_BLOCKING_THRESHOLD } from './default-blocking-threshold';

describe('DEFAULT_BLOCKING_THRESHOLD', () => {
  it('blocks on high severity when a council declares no threshold', () => {
    expect(DEFAULT_BLOCKING_THRESHOLD).toBe('high');
  });
});
