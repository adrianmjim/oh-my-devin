import { describe, expect, it } from 'vitest';
import { COMMAND_LINE_PATTERN } from './command-line-pattern';

describe('COMMAND_LINE_PATTERN', () => {
  it('matches an indented omd invocation', () => {
    expect(COMMAND_LINE_PATTERN.test('    omd run reviewer')).toBe(true);
  });

  it('ignores prose mentioning omd', () => {
    expect(COMMAND_LINE_PATTERN.test('run omd yourself')).toBe(false);
  });

  it('ignores a bare omd with no arguments', () => {
    expect(COMMAND_LINE_PATTERN.test('    omd')).toBe(false);
  });
});
