import { describe, expect, it } from 'vitest';
import { modeInvocationOf } from './mode-invocation-of';

describe('modeInvocationOf', () => {
  it('reads the mode invocation out of a bare command', () => {
    expect(modeInvocationOf('omd mode set plan')).toBe('mode set plan');
  });

  it('reads it out of a command invoking omd by path', () => {
    expect(modeInvocationOf('/usr/local/bin/omd mode clear')).toBe(
      'mode clear',
    );
  });

  it('collapses the spacing it was written with', () => {
    expect(modeInvocationOf('  omd   mode   set   team  ')).toBe(
      'mode set team',
    );
  });

  it('keeps the flags the invocation carries', () => {
    expect(modeInvocationOf('omd mode set ralph --run run-7')).toBe(
      'mode set ralph --run run-7',
    );
  });

  it('reads nothing out of a command that invokes another verb', () => {
    expect(modeInvocationOf('omd status --json')).toBeNull();
  });

  it('reads nothing out of a command that does not invoke omd', () => {
    expect(modeInvocationOf('git commit -m "mode set plan"')).toBeNull();
    expect(modeInvocationOf('')).toBeNull();
  });

  it('reads nothing out of a bare omd invocation', () => {
    expect(modeInvocationOf('omd')).toBeNull();
  });

  it('reads it out of a command that chains into omd', () => {
    expect(modeInvocationOf('cd /repo && omd mode set ralph')).toBe(
      'mode set ralph',
    );
  });

  it('stops at the shell operator that ends the invocation', () => {
    expect(modeInvocationOf('omd mode set plan && echo done')).toBe(
      'mode set plan',
    );
    expect(modeInvocationOf('omd mode clear; ls')).toBe('mode clear');
    expect(modeInvocationOf('omd mode set team | tee log')).toBe(
      'mode set team',
    );
  });

  it('cuts a redirection and its descriptor prefix as a unit', () => {
    expect(modeInvocationOf('omd mode set plan 2>/dev/null')).toBe(
      'mode set plan',
    );
    expect(modeInvocationOf('omd mode set plan 2>&1')).toBe('mode set plan');
    expect(modeInvocationOf('omd mode set plan >out.txt')).toBe(
      'mode set plan',
    );
    expect(modeInvocationOf('omd mode clear < answers')).toBe('mode clear');
  });

  it('matches the invocation an omd process reads off its own argv', () => {
    const argv: readonly string[] = ['mode', 'set', 'plan'];

    expect(modeInvocationOf('omd mode set plan')).toBe(argv.join(' '));
  });
});
