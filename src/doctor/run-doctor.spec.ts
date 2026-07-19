import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { CheckResult } from './check-result';
import type { DoctorReport } from './doctor-report';
import { runDoctor } from './run-doctor';

type Respond = (inv: CommandInvocation) => CommandResult | 'throw';

class DoctorRunner implements CommandRunner {
  public constructor(private readonly respond: Respond) {}

  public run(inv: CommandInvocation): Promise<CommandResult> {
    const outcome: CommandResult | 'throw' = this.respond(inv);
    if (outcome === 'throw') {
      return Promise.reject(new Error('spawn devin ENOENT'));
    }
    return Promise.resolve(outcome);
  }
}

function ok(stdout: string): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

const HEALTHY: Respond = (inv: CommandInvocation): CommandResult => {
  if (inv.args.includes('--agent-config')) {
    return ok('');
  }
  if (inv.args.includes('list')) {
    return ok('[]');
  }
  return ok('devin 3000.1.27');
};

function outcomeOf(report: DoctorReport, name: string): string {
  const check: CheckResult | undefined = report.checks.find(
    (c: CheckResult): boolean => c.name === name,
  );
  return check?.outcome ?? 'absent';
}

describe('runDoctor', () => {
  it('runs a fixed inventory of five checks', async () => {
    const report: DoctorReport = await runDoctor({
      runner: new DoctorRunner(HEALTHY),
      nodeVersion: '20.11.0',
    });
    expect(report.checks).toHaveLength(5);
  });

  it('passes every check and exits 0 in a healthy environment', async () => {
    const report: DoctorReport = await runDoctor({
      runner: new DoctorRunner(HEALTHY),
      nodeVersion: '22.0.0',
    });
    expect(
      report.checks.every((c: CheckResult): boolean => c.outcome === 'pass'),
    ).toBe(true);
    expect(report.exitCode).toBe(0);
  });

  it('fails and exits non-zero when the devin executable is missing', async () => {
    const report: DoctorReport = await runDoctor({
      runner: new DoctorRunner((): 'throw' => 'throw'),
      nodeVersion: '20.0.0',
    });
    expect(outcomeOf(report, 'devin-cli')).toBe('fail');
    expect(report.exitCode).not.toBe(0);
  });

  it('warns without failing when the devin version drifts from the pin', async () => {
    const drift: Respond = (inv: CommandInvocation): CommandResult => {
      if (inv.args.includes('--agent-config')) return ok('');
      if (inv.args.includes('list')) return ok('[]');
      return ok('devin 3000.9.0');
    };
    const report: DoctorReport = await runDoctor({
      runner: new DoctorRunner(drift),
      nodeVersion: '20.0.0',
    });
    expect(outcomeOf(report, 'devin-version')).toBe('warn');
    expect(report.exitCode).toBe(0);
  });

  it('fails the headless probe when the listing shape is wrong', async () => {
    const badList: Respond = (inv: CommandInvocation): CommandResult => {
      if (inv.args.includes('--agent-config')) return ok('');
      if (inv.args.includes('list')) return ok('not json');
      return ok('devin 3000.1.27');
    };
    const report: DoctorReport = await runDoctor({
      runner: new DoctorRunner(badList),
      nodeVersion: '20.0.0',
    });
    expect(outcomeOf(report, 'headless-surface')).toBe('fail');
    expect(report.exitCode).not.toBe(0);
  });

  it('fails the node check on a too-old runtime', async () => {
    const report: DoctorReport = await runDoctor({
      runner: new DoctorRunner(HEALTHY),
      nodeVersion: '18.19.0',
    });
    expect(outcomeOf(report, 'node-runtime')).toBe('fail');
    expect(report.exitCode).not.toBe(0);
  });

  it('fails the agent-config probe when the CLI rejects the bundle', async () => {
    const rejectBundle: Respond = (inv: CommandInvocation): CommandResult => {
      if (inv.args.includes('--agent-config')) {
        return { stdout: '', stderr: 'unknown field', exitCode: 1 };
      }
      if (inv.args.includes('list')) return ok('[]');
      return ok('devin 3000.1.27');
    };
    const report: DoctorReport = await runDoctor({
      runner: new DoctorRunner(rejectBundle),
      nodeVersion: '20.0.0',
    });
    expect(outcomeOf(report, 'agent-config')).toBe('fail');
    expect(report.exitCode).not.toBe(0);
  });
});
