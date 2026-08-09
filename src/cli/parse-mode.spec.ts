import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { ModeClearCommand } from './mode-clear-command';
import type { ModeSetCommand } from './mode-set-command';
import { parseMode } from './parse-mode';

describe('parseMode', () => {
  it('parses the set subcommand with its mode', () => {
    const command = parseMode(['set', 'ralph']);

    expect(command.kind).toBe('mode-set');
    expect((command as ModeSetCommand).mode).toBe('ralph');
  });

  it('correlates no run when the flag is absent', () => {
    expect((parseMode(['set', 'ralph']) as ModeSetCommand).runId).toBeNull();
  });

  it('records the correlated run the flag names', () => {
    const command = parseMode(['set', 'ralph', '--run', 'run-7']);

    expect((command as ModeSetCommand).runId).toBe('run-7');
  });

  it('carries the invocation the session staged', () => {
    expect((parseMode(['set', 'ralph']) as ModeSetCommand).invocation).toBe(
      'mode set ralph',
    );
    expect(
      (parseMode(['set', 'ralph', '--run', 'run-7']) as ModeSetCommand)
        .invocation,
    ).toBe('mode set ralph --run run-7');
  });

  it('parses the clear subcommand as clearing every slot', () => {
    const command = parseMode(['clear']);

    expect(command.kind).toBe('mode-clear');
    expect((command as ModeClearCommand).mode).toBeNull();
    expect((command as ModeClearCommand).invocation).toBe('mode clear');
  });

  it('parses the clear subcommand with the slot it targets', () => {
    const command = parseMode(['clear', 'ralph']);

    expect((command as ModeClearCommand).mode).toBe('ralph');
    expect((command as ModeClearCommand).invocation).toBe('mode clear ralph');
  });

  it('rejects set without a mode', () => {
    expect(() => parseMode(['set'])).toThrow(UsageError);
  });

  it('rejects a flag where the mode is expected', () => {
    expect(() => parseMode(['set', '--json'])).toThrow(UsageError);
  });

  it('rejects trailing arguments after the mode', () => {
    expect(() => parseMode(['set', 'ralph', 'extra'])).toThrow(UsageError);
  });

  it('rejects trailing arguments after the cleared mode', () => {
    expect(() => parseMode(['clear', 'ralph', 'extra'])).toThrow(UsageError);
  });

  it('rejects a correlated run with no identity', () => {
    expect(() => parseMode(['set', 'ralph', '--run'])).toThrow(UsageError);
  });

  it('rejects a correlated run placed before the mode', () => {
    expect(() => parseMode(['set', '--run', 'run-7', 'ralph'])).toThrow(
      UsageError,
    );
  });

  it('rejects a correlated run standing in for the mode', () => {
    expect(() => parseMode(['set', '--run', 'run-7'])).toThrow(UsageError);
  });

  it('rejects a repeated run flag', () => {
    expect(() =>
      parseMode(['set', 'ralph', '--run', 'run-7', '--run']),
    ).toThrow(UsageError);
  });

  it('rejects a correlated run on clear', () => {
    expect(() => parseMode(['clear', '--run', 'run-7'])).toThrow(UsageError);
  });

  it('rejects an unknown flag', () => {
    expect(() => parseMode(['set', 'ralph', '--json'])).toThrow(UsageError);
  });

  it('rejects an unknown subcommand', () => {
    expect(() => parseMode(['toggle'])).toThrow(UsageError);
  });
});
