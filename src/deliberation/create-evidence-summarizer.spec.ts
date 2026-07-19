import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { AnonymizedArgument } from './anonymized-argument';
import type { EvidenceSummarizer } from './evidence-summarizer';
import { createEvidenceSummarizer } from './create-evidence-summarizer';

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

const ARGUMENTS: readonly AnonymizedArgument[] = [
  {
    kind: 'objection',
    domain: 'operability',
    severity: 'high',
    concern: 'deployment_coupling',
  },
  {
    kind: 'preference',
    domain: 'delivery',
    severity: 'low',
    concern: 'faster_initial_delivery',
  },
];

describe('createEvidenceSummarizer', () => {
  it('runs exactly one single-turn default-tier call with no model or resume flags', async () => {
    const runner = new RecordingRunner({
      stdout: '  The round weighed coupling against delivery speed. \n',
      stderr: '',
      exitCode: 0,
    });
    const summarize: EvidenceSummarizer = createEvidenceSummarizer(runner);

    const summary: string | null = await summarize(ARGUMENTS);

    expect(summary).toBe('The round weighed coupling against delivery speed.');
    expect(runner.invocations).toHaveLength(1);
    expect(runner.invocations[0]?.command).toBe('devin');
    expect(runner.invocations[0]?.args[0]).toBe('-p');
    expect(runner.invocations[0]?.args).toHaveLength(2);
    expect(runner.invocations[0]?.args).not.toContain('--model');
    expect(runner.invocations[0]?.args).not.toContain('--resume');
  });

  it('asks for a neutral summary over the anonymized arguments', async () => {
    const runner = new RecordingRunner({
      stdout: 'summary',
      stderr: '',
      exitCode: 0,
    });
    const summarize: EvidenceSummarizer = createEvidenceSummarizer(runner);

    await summarize(ARGUMENTS);

    const prompt: string = runner.invocations[0]?.args[1] ?? '';
    expect(prompt.toLowerCase()).toContain('neutral');
    expect(prompt).toContain('deployment_coupling');
    expect(prompt).toContain('faster_initial_delivery');
  });

  it('returns null when the engine call fails, exits non-zero, or says nothing', async () => {
    const failing: EvidenceSummarizer =
      createEvidenceSummarizer(FAILING_RUNNER);
    const nonZero: EvidenceSummarizer = createEvidenceSummarizer(
      new RecordingRunner({ stdout: 'summary', stderr: '', exitCode: 1 }),
    );
    const silent: EvidenceSummarizer = createEvidenceSummarizer(
      new RecordingRunner({ stdout: '   ', stderr: '', exitCode: 0 }),
    );

    expect(await failing(ARGUMENTS)).toBeNull();
    expect(await nonZero(ARGUMENTS)).toBeNull();
    expect(await silent(ARGUMENTS)).toBeNull();
  });
});
