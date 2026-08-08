import { describe, expect, it } from 'vitest';
import { BENCH_MODEL } from './bench-model';

describe('BENCH_MODEL', () => {
  it('pins the model a bench run uses unless overridden', () => {
    expect(BENCH_MODEL).toBe('gpt-5.6-luna');
  });

  it('names a fully qualified variant rather than a drifting alias', () => {
    expect(BENCH_MODEL).not.toBe('swe');
    expect(BENCH_MODEL.trim()).toBe(BENCH_MODEL);
  });
});
