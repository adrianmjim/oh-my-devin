import { describe, expect, it } from 'vitest';
import { BENCH_GUARD_MESSAGE } from './bench-guard-message';

describe('BENCH_GUARD_MESSAGE', () => {
  it('names both opt-in values so a bare run is not a silent pass', () => {
    expect(BENCH_GUARD_MESSAGE).toContain('OMD_BENCH=1');
    expect(BENCH_GUARD_MESSAGE).toContain('OMD_BENCH=dry');
  });

  it('says why the opt-in exists', () => {
    expect(BENCH_GUARD_MESSAGE).toContain('quota');
  });
});
