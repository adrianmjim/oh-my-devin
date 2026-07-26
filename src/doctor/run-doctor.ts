import type { CommandResult } from '../engine/command-result';
import { agentConfigCheck } from './agent-config-check';
import type { CheckResult } from './check-result';
import { devinPresenceCheck } from './devin-presence-check';
import { devinVersionCheck } from './devin-version-check';
import type { DoctorDependencies } from './doctor-dependencies';
import type { DoctorReport } from './doctor-report';
import { headlessSurfaceCheck } from './headless-surface-check';
import { nodeRuntimeCheck } from './node-runtime-check';
import { tryRunDevin } from './try-run-devin';

export async function runDoctor(
  deps: DoctorDependencies,
): Promise<DoctorReport> {
  const version: CommandResult | null = await tryRunDevin(deps.runner, [
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
