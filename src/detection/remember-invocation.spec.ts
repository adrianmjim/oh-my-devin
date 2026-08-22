import { describe, expect, it } from 'vitest';
import { rememberInvocation } from './remember-invocation';

describe('rememberInvocation', () => {
  it('names the exact verb that confirms the principle', () => {
    expect(rememberInvocation('In this project, always lint.')).toBe(
      "omd memory remember 'In this project, always lint.'",
    );
  });

  it('keeps a double-quoted principle runnable as written', () => {
    expect(rememberInvocation('call it the "gate"')).toBe(
      'omd memory remember \'call it the "gate"\'',
    );
  });

  it('escapes embedded single quotes without breaking the quoting', () => {
    expect(rememberInvocation("don't skip the gate")).toBe(
      "omd memory remember 'don'\\''t skip the gate'",
    );
  });

  it('keeps shell-expandable text literal', () => {
    expect(rememberInvocation('always export $HOME before $(devin list)')).toBe(
      "omd memory remember 'always export $HOME before $(devin list)'",
    );
  });
});
