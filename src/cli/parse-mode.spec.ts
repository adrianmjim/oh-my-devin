import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { ModeSetCommand } from './mode-set-command';
import { parseMode } from './parse-mode';

describe('parseMode', () => {
  it('parses the set subcommand with its mode', () => {
    const command = parseMode(['set', 'ralph']);

    expect(command.kind).toBe('mode-set');
    expect((command as ModeSetCommand).mode).toBe('ralph');
  });

  it('parses the clear subcommand', () => {
    expect(parseMode(['clear']).kind).toBe('mode-clear');
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

  it('rejects trailing arguments after clear', () => {
    expect(() => parseMode(['clear', 'ralph'])).toThrow(UsageError);
  });

  it('rejects an unknown subcommand', () => {
    expect(() => parseMode(['toggle'])).toThrow(UsageError);
  });
});
