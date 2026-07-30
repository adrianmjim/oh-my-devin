import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { CheckResult } from './check-result';
import { PROBE_ROLE } from './probe-role';
import { tryRunDevin } from './try-run-devin';

export async function agentConfigCheck(
  runner: CommandRunner,
): Promise<CheckResult> {
  const dir: string = await mkdtemp(join(tmpdir(), 'omd-doctor-'));
  const bundlePath: string = join(dir, 'agent-config.json');
  try {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(PROBE_ROLE, dir);
    const expectedFields: readonly string[] = [
      'system_instructions',
      'allowed_tools',
      'permissions',
    ];
    const missing: string | undefined = expectedFields.find(
      (field: string): boolean => !(field in bundle),
    );
    if (missing !== undefined) {
      return {
        name: 'agent-config',
        outcome: 'fail',
        message: `compiled bundle is missing the ${missing} field`,
      };
    }

    await writeFile(bundlePath, JSON.stringify(bundle), 'utf8');
    const result: CommandResult | null = await tryRunDevin(runner, [
      '--agent-config',
      bundlePath,
      '--version',
    ]);
    if (result?.exitCode !== 0) {
      return {
        name: 'agent-config',
        outcome: 'fail',
        message: 'devin rejected the compiled --agent-config bundle',
      };
    }
    return {
      name: 'agent-config',
      outcome: 'pass',
      message: 'devin accepts the compiled --agent-config bundle',
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
