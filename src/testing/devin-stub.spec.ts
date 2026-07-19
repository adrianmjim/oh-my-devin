import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import { DevinStub } from './devin-stub';

function turn(stdout: string): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

describe('DevinStub', () => {
  it('plays scripted turn responses in FIFO order across -p and --resume', async () => {
    const stub: DevinStub = new DevinStub({
      turns: [turn('first'), turn('second')],
      listResponse: null,
    });

    const first: CommandResult = await stub.run({
      command: 'devin',
      args: ['-p', 'do the thing'],
    });
    const second: CommandResult = await stub.run({
      command: 'devin',
      args: ['--resume', 's1', '-p', 'again'],
    });

    expect(first.stdout).toBe('first');
    expect(second.stdout).toBe('second');
  });

  it('records every invocation with its command and argument vector', async () => {
    const stub: DevinStub = new DevinStub({
      turns: [turn('ok')],
      listResponse: null,
    });
    const invocation: CommandInvocation = {
      command: 'devin',
      args: ['-p', 'task', '--agent-config', 'bundle.json', '--model', 'opus'],
    };

    await stub.run(invocation);

    expect(stub.invocations).toHaveLength(1);
    expect(stub.invocations[0]).toEqual(invocation);
  });

  it('answers a `devin list --format json` invocation with the scripted list response', async () => {
    const listing: CommandResult = turn('[{"id":"s1"}]');
    const stub: DevinStub = new DevinStub({ turns: [], listResponse: listing });

    const listed: CommandResult = await stub.run({
      command: 'devin',
      args: ['list', '--format', 'json'],
    });

    expect(listed.stdout).toBe('[{"id":"s1"}]');
  });

  it('plays queued list responses in order before falling back to the standing one', async () => {
    const stub: DevinStub = new DevinStub({
      turns: [],
      listResponse: turn('[{"id":"later"}]'),
      listResponses: [turn('[]')],
    });
    const list: CommandInvocation = {
      command: 'devin',
      args: ['list', '--format', 'json'],
    };

    const first: CommandResult = await stub.run(list);
    const second: CommandResult = await stub.run(list);

    expect(first.stdout).toBe('[]');
    expect(second.stdout).toBe('[{"id":"later"}]');
  });

  it('rejects when a turn is requested but no scripted turn response remains', async () => {
    const stub: DevinStub = new DevinStub({ turns: [], listResponse: null });

    await expect(
      stub.run({ command: 'devin', args: ['-p', 'task'] }),
    ).rejects.toThrow(/no scripted turn response/);
  });

  it('rejects a list invocation when no list response was scripted', async () => {
    const stub: DevinStub = new DevinStub({ turns: [], listResponse: null });

    await expect(
      stub.run({ command: 'devin', args: ['list', '--format', 'json'] }),
    ).rejects.toThrow(/no listResponse/);
  });
});
