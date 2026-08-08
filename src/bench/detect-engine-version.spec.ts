import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { detectEngineVersion } from './detect-engine-version';

class StubRunner implements CommandRunner {
  public readonly invocations: CommandInvocation[] = [];

  public constructor(private readonly result: CommandResult | Error) {}

  public run(invocation: CommandInvocation): Promise<CommandResult> {
    this.invocations.push(invocation);
    if (this.result instanceof Error) {
      return Promise.reject(this.result);
    }
    return Promise.resolve(this.result);
  }
}

describe('detectEngineVersion', () => {
  it('parses the version the engine reports', async () => {
    const runner: StubRunner = new StubRunner({
      stdout: 'devin 3000.3.27 (0becb483)\n',
      stderr: '',
      exitCode: 0,
    });

    await expect(detectEngineVersion(runner)).resolves.toBe('3000.3.27');
    expect(runner.invocations[0]).toEqual({
      command: 'devin',
      args: ['--version'],
    });
  });

  it('reports an unknown version when the engine is absent', async () => {
    const runner: StubRunner = new StubRunner(new Error('ENOENT'));

    await expect(detectEngineVersion(runner)).resolves.toBe('unknown');
  });

  it('reports an unknown version when the output carries none', async () => {
    const runner: StubRunner = new StubRunner({
      stdout: 'no version here',
      stderr: '',
      exitCode: 0,
    });

    await expect(detectEngineVersion(runner)).resolves.toBe('unknown');
  });
});
