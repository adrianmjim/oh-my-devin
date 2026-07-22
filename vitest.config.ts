import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: [
      ...configDefaults.exclude,
      'src/**/*.smoke.spec.ts',
      'src/**/*.e2e.spec.ts',
    ],
    environment: 'node',
  },
});
