import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { DevinHeadlessEngine } from '../engine/devin-headless-engine';
import type { RoleDefinition } from '../role/role-definition';
import type { CheckResult } from './check-result';
import type { DoctorDependencies } from './doctor-dependencies';
import type { DoctorReport } from './doctor-report';

const PINNED_DEVIN_VERSION: string = '3000.1.27';
const MIN_NODE_MAJOR: number = 20;
const VERSION_PATTERN: RegExp = /(\d+\.\d+\.\d+)/;

const PROBE_ROLE: RoleDefinition = {
  name: 'omd-doctor-probe',
  engine: 'devin',
  agentType: null,
  model: null,
  tools: [],
  permissions: { allow: [], deny: [], ask: [] },
  outputArtifact: 'probe.json',
  outputSchema: 'probe.schema.json',
  maxTurns: 1,
  contextPolicy: 'isolated',
  wallTimeMs: null,
  promptBody: 'probe',
};

export async function runDoctor(
  deps: DoctorDependencies,
): Promise<DoctorReport> {
  const version: CommandResult | null = await tryRun(deps.runner, [
    '--version',
  ]);

  const checks: CheckResult[] = [
    devinPresenceCheck(version),
    devinVersionCheck(version),
    await agentConfigCheck(deps.runner),
    await headlessSurfaceCheck(deps.runner),
    nodeRuntimeCheck(deps.nodeVersion),
  ];

  const exitCode: number = checks.some(
    (check: CheckResult): boolean => check.outcome === 'fail',
  )
    ? 1
    : 0;

  return { checks, exitCode };
}

async function tryRun(
  runner: CommandRunner,
  args: readonly string[],
): Promise<CommandResult | null> {
  try {
    return await runner.run({ command: 'devin', args: [...args] });
  } catch {
    return null;
  }
}

function devinPresenceCheck(version: CommandResult | null): CheckResult {
  if (version?.exitCode !== 0) {
    return {
      name: 'devin-cli',
      outcome: 'fail',
      message: 'devin executable not found on PATH',
    };
  }
  return {
    name: 'devin-cli',
    outcome: 'pass',
    message: 'devin executable found on PATH',
  };
}

function devinVersionCheck(version: CommandResult | null): CheckResult {
  const detected: string | null =
    version === null ? null : parseVersion(version.stdout);
  if (detected === null) {
    return {
      name: 'devin-version',
      outcome: 'fail',
      message: 'could not determine the installed devin version',
    };
  }
  if (detected === PINNED_DEVIN_VERSION) {
    return {
      name: 'devin-version',
      outcome: 'pass',
      message: `devin ${detected} matches the pinned version`,
    };
  }
  return {
    name: 'devin-version',
    outcome: 'warn',
    message: `devin ${detected} drifts from pinned ${PINNED_DEVIN_VERSION}`,
  };
}

async function agentConfigCheck(runner: CommandRunner): Promise<CheckResult> {
  const bundle: AgentConfigBundle = compileAgentConfigBundle(PROBE_ROLE);
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

  const dir: string = await mkdtemp(join(tmpdir(), 'omd-doctor-'));
  const bundlePath: string = join(dir, 'agent-config.json');
  try {
    await writeFile(bundlePath, JSON.stringify(bundle), 'utf8');
    const result: CommandResult | null = await tryRun(runner, [
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

async function headlessSurfaceCheck(
  runner: CommandRunner,
): Promise<CheckResult> {
  const result: CommandResult | null = await tryRun(runner, [
    'list',
    '--format',
    'json',
  ]);
  if (result?.exitCode !== 0) {
    return {
      name: 'headless-surface',
      outcome: 'fail',
      message: 'devin list --format json did not run',
    };
  }
  try {
    new DevinHeadlessEngine().parseSessionListing(result.stdout);
  } catch {
    return {
      name: 'headless-surface',
      outcome: 'fail',
      message: 'devin list --format json returned an unexpected shape',
    };
  }
  return {
    name: 'headless-surface',
    outcome: 'pass',
    message: 'devin list --format json returns the expected shape',
  };
}

function nodeRuntimeCheck(nodeVersion: string): CheckResult {
  const major: number = Number.parseInt(nodeVersion.split('.')[0] ?? '', 10);
  if (Number.isNaN(major) || major < MIN_NODE_MAJOR) {
    return {
      name: 'node-runtime',
      outcome: 'fail',
      message: `Node.js ${nodeVersion} is below the required ${MIN_NODE_MAJOR}`,
    };
  }
  return {
    name: 'node-runtime',
    outcome: 'pass',
    message: `Node.js ${nodeVersion} satisfies the minimum`,
  };
}

function parseVersion(stdout: string): string | null {
  const match: RegExpExecArray | null = VERSION_PATTERN.exec(stdout);
  return match?.[1] ?? null;
}
