import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.e2e.spec.ts'],
    environment: 'node',
    passWithNoTests: true,
    testTimeout: 30000,
  },
});
