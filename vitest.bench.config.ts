import { defineConfig } from 'vitest/config';

const BENCH_TIMEOUT_MS: number = 1800000;

export default defineConfig({
  test: {
    include: ['src/**/*.bench.spec.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: BENCH_TIMEOUT_MS,
    hookTimeout: BENCH_TIMEOUT_MS,
  },
});
