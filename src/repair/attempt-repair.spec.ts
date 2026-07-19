import { describe, expect, it } from 'vitest';
import type { ArtifactValidation } from '../artifact/artifact-validation';
import type { CommandResult } from '../engine/command-result';
import { DevinHeadlessEngine } from '../engine/devin-headless-engine';
import { HeadlessSessionAdapter } from '../session/headless-session-adapter';
import type { SessionConfig } from '../session/session-config';
import type { SessionTurnResult } from '../session/session-turn-result';
import { DevinStub } from '../testing/devin-stub';
import { attemptRepair } from './attempt-repair';

function turn(stdout: string): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

const CONFIG: SessionConfig = {
  agentConfigPath: '/tmp/bundle.json',
  model: null,
  workingDirectory: '/repo/a',
};
const LISTING: CommandResult = turn(
  '[{"id":"s1","working_directory":"/repo/a"}]',
);

describe('attemptRepair', () => {
  it('resumes the same session exactly once, feeding the validation report', async () => {
    const stub = new DevinStub({
      turns: [turn('initial'), turn('repaired')],
      listResponse: LISTING,
      listResponses: [turn('[]')],
    });
    const adapter = new HeadlessSessionAdapter(
      stub,
      new DevinHeadlessEngine(),
      CONFIG,
    );
    await adapter.sendTurn('do the work');

    const validation: ArtifactValidation = {
      valid: false,
      missing: false,
      errors: ['(root) must have required property verdict'],
    };
    const result: SessionTurnResult = await attemptRepair(
      adapter,
      validation,
      '{"type":"object"}',
    );

    expect(result.stdout).toBe('repaired');
    const resumes = stub.invocations.filter((i) => i.args.includes('--resume'));
    expect(resumes).toHaveLength(1);
    expect(resumes[0]?.args).toEqual([
      '--resume',
      's1',
      '-p',
      expect.stringContaining('must have required property verdict'),
      '--agent-config',
      '/tmp/bundle.json',
    ]);
  });
});
