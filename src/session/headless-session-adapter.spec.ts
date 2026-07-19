import { describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { DevinHeadlessEngine } from '../engine/devin-headless-engine';
import { DevinStub } from '../testing/devin-stub';
import type { SessionConfig } from './session-config';
import type { SessionTurnResult } from './session-turn-result';
import { HeadlessSessionAdapter } from './headless-session-adapter';

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

function adapter(stub: DevinStub): HeadlessSessionAdapter {
  return new HeadlessSessionAdapter(stub, new DevinHeadlessEngine(), CONFIG);
}

describe('HeadlessSessionAdapter', () => {
  it('drives the first turn as a single fresh `-p` invocation and discovers its session id by working directory', async () => {
    const stub = new DevinStub({
      turns: [turn('first')],
      listResponse: LISTING,
    });

    const result: SessionTurnResult = await adapter(stub).sendTurn('do work');

    expect(result.sessionId).toBe('s1');
    expect(result.stdout).toBe('first');
    const turnInvocations = stub.invocations.filter((i) =>
      i.args.includes('-p'),
    );
    expect(turnInvocations).toHaveLength(1);
    expect(turnInvocations[0]?.args).not.toContain('--resume');
  });

  it('resumes the discovered session by identifier without re-supplying earlier context', async () => {
    const stub = new DevinStub({
      turns: [turn('first'), turn('second')],
      listResponse: LISTING,
    });
    const session = adapter(stub);

    await session.sendTurn('remember X');
    const second: SessionTurnResult = await session.sendTurn('use it');

    expect(second.sessionId).toBe('s1');
    const resume = stub.invocations.find((i) => i.args.includes('--resume'));
    expect(resume?.args).toEqual([
      '--resume',
      's1',
      '-p',
      'use it',
      '--agent-config',
      '/tmp/bundle.json',
    ]);
  });

  it('enumerates only once and caches the session id', async () => {
    const stub = new DevinStub({
      turns: [turn('a'), turn('b')],
      listResponse: LISTING,
    });
    const session = adapter(stub);

    await session.sendTurn('one');
    await session.sendTurn('two');

    const listInvocations = stub.invocations.filter((i) =>
      i.args.includes('list'),
    );
    expect(listInvocations).toHaveLength(1);
  });

  it('leaves the session id null when no session matches the working directory', async () => {
    const stub = new DevinStub({
      turns: [turn('x')],
      listResponse: turn('[{"id":"other","working_directory":"/repo/z"}]'),
    });
    const session = adapter(stub);

    const result: SessionTurnResult = await session.sendTurn('go');

    expect(result.sessionId).toBeNull();
    expect(session.currentSessionId).toBeNull();
  });

  it('exposes the current session id only after discovery', async () => {
    const stub = new DevinStub({ turns: [turn('x')], listResponse: LISTING });
    const session = adapter(stub);

    expect(session.currentSessionId).toBeNull();
    await session.sendTurn('go');
    expect(session.currentSessionId).toBe('s1');
  });
});
