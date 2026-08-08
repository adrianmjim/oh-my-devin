import { join } from 'node:path';
import { BENCH_ROOT_DIR } from './bench-root-dir';

export const BENCH_BASELINES_DIR: string = join(BENCH_ROOT_DIR, 'baselines');
