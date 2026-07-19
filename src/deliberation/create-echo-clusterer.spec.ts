import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { ArgumentClusterer } from './argument-clusterer';
import type { ClaimClusters } from './claim-clusters';
import { createEchoClusterer } from './create-echo-clusterer';

class RecordingRunner implements CommandRunner {
  public readonly invocations: CommandInvocation[] = [];

  public constructor(private readonly result: CommandResult) {}

  public run(invocation: CommandInvocation): Promise<CommandResult> {
    this.invocations.push(invocation);
    return Promise.resolve(this.result);
  }
}

const FAILING_RUNNER: CommandRunner = {
  run: (): Promise<never> => Promise.reject(new Error('engine down')),
};

function output(stdout: string, exitCode: number = 0): CommandResult {
  return { stdout, stderr: '', exitCode };
}

const CLAIMS: readonly string[] = [
  'ship_it_for_speed',
  'ship_it_to_learn_fast',
  'wait_for_the_audit',
];

describe('createEchoClusterer', () => {
  it('runs exactly one single-turn default-tier call with no model or resume flags', async () => {
    const runner = new RecordingRunner(output('[[0,1],[2]]'));
    const cluster: ArgumentClusterer = createEchoClusterer(runner);

    const clusters: ClaimClusters = await cluster(CLAIMS);

    expect(clusters).toEqual([[0, 1], [2]]);
    expect(runner.invocations).toHaveLength(1);
    expect(runner.invocations[0]?.command).toBe('devin');
    expect(runner.invocations[0]?.args[0]).toBe('-p');
    expect(runner.invocations[0]?.args).toHaveLength(2);
    expect(runner.invocations[0]?.args).not.toContain('--model');
    expect(runner.invocations[0]?.args).not.toContain('--resume');
  });

  it('asks to cluster same-action same-justification claims over the indexed list', async () => {
    const runner = new RecordingRunner(output('[[0],[1],[2]]'));
    const cluster: ArgumentClusterer = createEchoClusterer(runner);

    await cluster(CLAIMS);

    const prompt: string = runner.invocations[0]?.args[1] ?? '';
    expect(prompt).toContain('same recommended action');
    expect(prompt).toContain('same primary justification');
    expect(prompt).toContain('0. ship_it_for_speed');
    expect(prompt).toContain('2. wait_for_the_audit');
  });

  it('falls back to identity clustering on unparseable output', async () => {
    const runner = new RecordingRunner(output('the clusters are obvious'));
    const cluster: ArgumentClusterer = createEchoClusterer(runner);

    expect(await cluster(CLAIMS)).toEqual([[0], [1], [2]]);
  });

  it('falls back when the output is not a partition of the claim indices', async () => {
    const duplicated: ArgumentClusterer = createEchoClusterer(
      new RecordingRunner(output('[[0,0],[1,2]]')),
    );
    const outOfRange: ArgumentClusterer = createEchoClusterer(
      new RecordingRunner(output('[[0],[1],[5]]')),
    );
    const incomplete: ArgumentClusterer = createEchoClusterer(
      new RecordingRunner(output('[[0,1]]')),
    );

    expect(await duplicated(CLAIMS)).toEqual([[0], [1], [2]]);
    expect(await outOfRange(CLAIMS)).toEqual([[0], [1], [2]]);
    expect(await incomplete(CLAIMS)).toEqual([[0], [1], [2]]);
  });

  it('falls back when the engine call fails or exits non-zero', async () => {
    const failing: ArgumentClusterer = createEchoClusterer(FAILING_RUNNER);
    const nonZero: ArgumentClusterer = createEchoClusterer(
      new RecordingRunner(output('[[0],[1],[2]]', 1)),
    );

    expect(await failing(CLAIMS)).toEqual([[0], [1], [2]]);
    expect(await nonZero(CLAIMS)).toEqual([[0], [1], [2]]);
  });
});
