import { BENCH_ENV } from './bench-env';
import type { BenchRunMode } from './bench-run-mode';

export function resolveBenchMode(
  env: Record<string, string | undefined>,
): BenchRunMode | null {
  const value: string = (env[BENCH_ENV] ?? '').trim();
  let mode: BenchRunMode | null = null;
  if (value === '1') {
    mode = 'real';
  } else if (value === 'dry') {
    mode = 'dry';
  }
  return mode;
}
