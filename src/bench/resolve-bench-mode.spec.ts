import { describe, expect, it } from 'vitest';
import type { BenchRunMode } from './bench-run-mode';
import { resolveBenchMode } from './resolve-bench-mode';

describe('resolveBenchMode', () => {
  it('selects the real path on the real opt-in', () => {
    const mode: BenchRunMode | null = resolveBenchMode({ OMD_BENCH: '1' });

    expect(mode).toBe('real');
  });

  it('selects the dry path on the dry opt-in', () => {
    expect(resolveBenchMode({ OMD_BENCH: 'dry' })).toBe('dry');
  });

  it('selects nothing without the opt-in so the suite can fail loudly', () => {
    expect(resolveBenchMode({})).toBeNull();
    expect(resolveBenchMode({ OMD_BENCH: '' })).toBeNull();
  });

  it('selects nothing for an unrecognised opt-in value', () => {
    expect(resolveBenchMode({ OMD_BENCH: 'yes' })).toBeNull();
  });
});
