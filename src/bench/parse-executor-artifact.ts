import { BenchFixtureError } from './bench-fixture-error';
import type { ExecutorArtifact } from './executor-artifact';
import type { ExecutorCommand } from './executor-command';
import { isExecutorTestsClaim } from './is-executor-tests-claim';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';

export function parseExecutorArtifact(
  value: unknown,
  source: string,
): ExecutorArtifact {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const tests: unknown = fields['tests'];
  if (!isExecutorTestsClaim(tests)) {
    throw new BenchFixtureError(
      `"${source}#tests" must be "passed" or "failed"`,
    );
  }
  const commands: unknown = fields['commands'];
  if (!Array.isArray(commands)) {
    throw new BenchFixtureError(`"${source}#commands" must be an array`);
  }
  return {
    tests,
    commands: commands.map((entry: unknown, index: number): ExecutorCommand => {
      const at: string = `${source}#commands[${index}]`;
      const command: Record<string, unknown> = requireBenchFields(entry, at);
      return {
        command: requireBenchString(command['command'], `${at}.command`),
        result: requireBenchString(command['result'], `${at}.result`),
      };
    }),
  };
}
