import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { MemoryRememberCommand } from './memory-remember-command';
import { parseMemory } from './parse-memory';

describe('parseMemory', () => {
  it('parses the remember subcommand with its text', () => {
    const command = parseMemory(['remember', 'the gate runs on staging']);

    expect(command.kind).toBe('memory-remember');
    expect((command as MemoryRememberCommand).text).toBe(
      'the gate runs on staging',
    );
  });

  it('rejects remember without text', () => {
    expect(() => parseMemory(['remember'])).toThrow(UsageError);
  });

  it('rejects a flag where the text is expected', () => {
    expect(() => parseMemory(['remember', '--json'])).toThrow(UsageError);
  });

  it('rejects blank text', () => {
    expect(() => parseMemory(['remember', '   '])).toThrow(UsageError);
  });

  it('rejects trailing arguments after the text', () => {
    expect(() => parseMemory(['remember', 'a note', 'extra'])).toThrow(
      UsageError,
    );
  });

  it('rejects an unknown subcommand', () => {
    expect(() => parseMemory(['forget'])).toThrow(UsageError);
    expect(() => parseMemory([])).toThrow(UsageError);
  });
});
