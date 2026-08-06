import { describe, expect, it } from 'vitest';
import { BENCH_MODEL } from './bench-model';

describe('BENCH_MODEL', () => {
  it('pins the model a bench run uses unless overridden', () => {
    expect(BENCH_MODEL).toBe('swe-1-6-slow');
  });

  it('names a fully qualified variant rather than a drifting alias', () => {
    expect(BENCH_MODEL).not.toBe('swe');
    expect(BENCH_MODEL.trim()).toBe(BENCH_MODEL);
  });
});
