import type { ArchitectArtifact } from './architect-artifact';
import type { ArchitectStep } from './architect-step';
import { BenchFixtureError } from './bench-fixture-error';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';

export function parseArchitectArtifact(
  value: unknown,
  source: string,
): ArchitectArtifact {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const approach: string = requireBenchString(
    fields['approach'],
    `${source}#approach`,
  );
  const steps: unknown = fields['steps'];
  if (!Array.isArray(steps)) {
    throw new BenchFixtureError(`"${source}#steps" must be an array`);
  }
  return {
    approach,
    steps: steps.map((entry: unknown, index: number): ArchitectStep => {
      const at: string = `${source}#steps[${index}]`;
      const step: Record<string, unknown> = requireBenchFields(entry, at);
      const files: unknown = step['files'] ?? [];
      if (!Array.isArray(files)) {
        throw new BenchFixtureError(`"${at}.files" must be an array`);
      }
      return {
        description: requireBenchString(
          step['description'],
          `${at}.description`,
        ),
        files: files.map((file: unknown, fileIndex: number): string =>
          requireBenchString(file, `${at}.files[${fileIndex}]`),
        ),
      };
    }),
  };
}
