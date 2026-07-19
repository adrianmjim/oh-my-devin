import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from './command-invocation';
import type { PromptTurn } from './prompt-turn';
import type { SessionListing } from './session-listing';
import { DevinHeadlessEngine } from './devin-headless-engine';
import { EngineError } from './engine-error';

const FRESH_TURN: PromptTurn = {
  prompt: 'do the work',
  agentConfigPath: '/tmp/bundle.json',
  model: null,
  resumeSessionId: null,
};

describe('DevinHeadlessEngine', () => {
  it('identifies itself as the devin engine', () => {
    expect(new DevinHeadlessEngine().kind).toBe('devin');
  });

  it('builds a fresh headless turn as a single `-p` invocation', () => {
    const engine: DevinHeadlessEngine = new DevinHeadlessEngine();

    const invocation: CommandInvocation = engine.turnInvocation(FRESH_TURN);

    expect(invocation.command).toBe('devin');
    expect(invocation.args).toEqual([
      '-p',
      'do the work',
      '--agent-config',
      '/tmp/bundle.json',
    ]);
  });

  it('resumes an existing session by identifier with `--resume`', () => {
    const engine: DevinHeadlessEngine = new DevinHeadlessEngine();

    const invocation: CommandInvocation = engine.turnInvocation({
      ...FRESH_TURN,
      prompt: 'again',
      resumeSessionId: 's1',
    });

    expect(invocation.args).toEqual([
      '--resume',
      's1',
      '-p',
      'again',
      '--agent-config',
      '/tmp/bundle.json',
    ]);
  });

  it('passes the declared model via `--model` when present', () => {
    const engine: DevinHeadlessEngine = new DevinHeadlessEngine();

    const invocation: CommandInvocation = engine.turnInvocation({
      ...FRESH_TURN,
      model: 'opus',
    });

    expect(invocation.args).toContain('--model');
    expect(invocation.args[invocation.args.indexOf('--model') + 1]).toBe(
      'opus',
    );
  });

  it('enumerates sessions via a machine-readable `list` invocation', () => {
    const engine: DevinHeadlessEngine = new DevinHeadlessEngine();

    const invocation: CommandInvocation = engine.listInvocation();

    expect(invocation.command).toBe('devin');
    expect(invocation.args).toEqual(['list', '--format', 'json']);
  });

  it('parses a session listing into ids and working directories', () => {
    const engine: DevinHeadlessEngine = new DevinHeadlessEngine();

    const listings: readonly SessionListing[] = engine.parseSessionListing(
      '[{"id":"s1","working_directory":"/repo/a"},{"id":"s2","working_directory":"/repo/b"}]',
    );

    expect(listings).toEqual([
      { id: 's1', workingDirectory: '/repo/a' },
      { id: 's2', workingDirectory: '/repo/b' },
    ]);
  });

  it('throws an EngineError when the listing is not machine-readable', () => {
    const engine: DevinHeadlessEngine = new DevinHeadlessEngine();

    expect(() => engine.parseSessionListing('not json')).toThrow(EngineError);
  });
});
