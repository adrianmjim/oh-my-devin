import {
  configDefaults,
  coverageConfigDefaults,
  defineConfig,
} from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: [
      ...configDefaults.exclude,
      'src/**/*.smoke.spec.ts',
      'src/**/*.e2e.spec.ts',
    ],
    environment: 'node',
    reporters: ['default', 'junit'],
    outputFile: { junit: './test-results/junit.xml' },
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'text'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/**/*.spec.ts',
        'src/**/*.smoke.spec.ts',
        'src/**/*.d.ts',
        'src/testing/**',
      ],
    },
  },
});
