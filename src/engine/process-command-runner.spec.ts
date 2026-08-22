import { describe, expect, it } from 'vitest';
import type { CommandResult } from './command-result';
import { ProcessCommandRunner } from './process-command-runner';

describe('ProcessCommandRunner', () => {
  it('runs a command in its working directory and captures stdout', async () => {
    const result: CommandResult = await new ProcessCommandRunner('/').run({
      command: process.execPath,
      args: ['-e', 'process.stdout.write(process.cwd())'],
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('/');
  });

  it('captures the exit code and stderr of a failing command', async () => {
    const result: CommandResult = await new ProcessCommandRunner('/').run({
      command: process.execPath,
      args: ['-e', 'process.stderr.write("boom"); process.exit(3)'],
    });

    expect(result.exitCode).toBe(3);
    expect(result.stderr).toBe('boom');
  });

  it('preserves a signal termination as a non-success result', async () => {
    const result: CommandResult = await new ProcessCommandRunner('/').run({
      command: process.execPath,
      args: ['-e', 'process.kill(process.pid, "SIGKILL")'],
    });

    expect(result.exitCode).toBeNull();
  });

  it('exports the invocation env to the child', async () => {
    const result: CommandResult = await new ProcessCommandRunner('/').run({
      command: process.execPath,
      args: [
        '-e',
        "process.stdout.write(process.env['OMD_RUNNER_PROBE'] ?? '')",
      ],
      env: { OMD_RUNNER_PROBE: 'probe-value' },
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('probe-value');
  });

  it('keeps the parent environment visible alongside the invocation env', async () => {
    const result: CommandResult = await new ProcessCommandRunner('/').run({
      command: process.execPath,
      args: ['-e', "process.stdout.write(process.env['PATH'] ?? '')"],
      env: { OMD_RUNNER_PROBE: 'probe-value' },
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toBe('');
  });

  it('rejects when the command cannot be spawned', async () => {
    await expect(
      new ProcessCommandRunner('/').run({
        command: 'omd-no-such-binary',
        args: [],
      }),
    ).rejects.toThrow();
  });
});
