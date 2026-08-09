import { describe, expect, it } from 'vitest';
import { SHELL_OPERATOR_PATTERN } from './shell-operator-pattern';

describe('SHELL_OPERATOR_PATTERN', () => {
  it('finds the operator that ends a command within a command line', () => {
    expect('mode clear; ls'.search(SHELL_OPERATOR_PATTERN)).toBe(10);
    expect('mode set plan && echo'.search(SHELL_OPERATOR_PATTERN)).toBe(14);
    expect('mode set team | tee'.search(SHELL_OPERATOR_PATTERN)).toBe(14);
  });

  it('finds the redirection with its descriptor prefix', () => {
    expect('mode set plan 2>/dev/null'.search(SHELL_OPERATOR_PATTERN)).toBe(14);
    expect('mode clear < answers'.search(SHELL_OPERATOR_PATTERN)).toBe(11);
  });

  it('finds no operator in an invocation that carries none', () => {
    expect('mode set ralph --run run-7'.search(SHELL_OPERATOR_PATTERN)).toBe(
      -1,
    );
  });
});
