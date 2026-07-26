import { describe, expect, it } from 'vitest';
import { hookCommandOf } from './hook-command-of';

describe('hookCommandOf', () => {
  it('yields the command of a command hook', () => {
    expect(hookCommandOf({ type: 'command', command: 'node x.mjs' })).toBe(
      'node x.mjs',
    );
  });

  it('is null for a hook of another type', () => {
    expect(hookCommandOf({ type: 'prompt', command: 'node x.mjs' })).toBeNull();
  });

  it('is null when the command is not a string', () => {
    expect(hookCommandOf({ type: 'command', command: 7 })).toBeNull();
  });

  it('is null for a value that is not a readable object', () => {
    expect(hookCommandOf(null)).toBeNull();
    expect(hookCommandOf('node x.mjs')).toBeNull();
  });
});
