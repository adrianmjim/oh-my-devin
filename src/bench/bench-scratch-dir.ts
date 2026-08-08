import { dirname, join } from 'node:path';
import { BENCH_ROOT_DIR } from './bench-root-dir';

export const BENCH_SCRATCH_DIR: string = join(
  dirname(BENCH_ROOT_DIR),
  'bench-scratch',
);
