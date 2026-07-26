import { describe, expect, it } from 'vitest';
import { DURATION_UNIT_MS } from './duration-unit-ms';

describe('DURATION_UNIT_MS', () => {
  it('converts every supported unit to milliseconds', () => {
    expect(DURATION_UNIT_MS).toEqual({
      ms: 1,
      s: 1000,
      m: 60000,
      h: 3600000,
    });
  });

  it('scales each unit by sixty from the one below it', () => {
    expect(DURATION_UNIT_MS['m']).toBe((DURATION_UNIT_MS['s'] ?? 0) * 60);
    expect(DURATION_UNIT_MS['h']).toBe((DURATION_UNIT_MS['m'] ?? 0) * 60);
  });
});
