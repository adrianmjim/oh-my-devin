import { describe, expect, it } from 'vitest';
import { rememberInvocation } from './remember-invocation';

describe('rememberInvocation', () => {
  it('names the exact verb that confirms the principle', () => {
    expect(rememberInvocation('In this project, always lint.')).toBe(
      'omd memory remember "In this project, always lint."',
    );
  });

  it('keeps a quoted principle runnable as written', () => {
    expect(rememberInvocation('call it the "gate"')).toBe(
      'omd memory remember "call it the \\"gate\\""',
    );
  });
});
