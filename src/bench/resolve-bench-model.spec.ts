import { describe, expect, it } from 'vitest';
import { BENCH_MODEL } from './bench-model';
import { resolveBenchModel } from './resolve-bench-model';

describe('resolveBenchModel', () => {
  it('pins the bench model when no override is set', () => {
    expect(resolveBenchModel({})).toBe(BENCH_MODEL);
  });

  it('takes the per-run override when it is set', () => {
    expect(resolveBenchModel({ OMD_BENCH_MODEL: 'claude-opus-5-high' })).toBe(
      'claude-opus-5-high',
    );
  });

  it('trims incidental whitespace from the override', () => {
    expect(resolveBenchModel({ OMD_BENCH_MODEL: ' claude-opus-5-high ' })).toBe(
      'claude-opus-5-high',
    );
  });

  it('ignores a blank override', () => {
    expect(resolveBenchModel({ OMD_BENCH_MODEL: '  ' })).toBe(BENCH_MODEL);
  });
});
