import { describe, expect, it } from 'vitest';
import { posixQuote } from './posix-quote';

describe('posixQuote', () => {
  it('single-quotes a plain path', () => {
    expect(posixQuote('/home/u/.config/devin/hooks/omd-mode.mjs')).toBe(
      "'/home/u/.config/devin/hooks/omd-mode.mjs'",
    );
  });

  it('keeps a path containing a space in one argument', () => {
    expect(posixQuote('/home/John Doe/.config/devin')).toBe(
      "'/home/John Doe/.config/devin'",
    );
  });

  it('leaves a dollar sign literal', () => {
    expect(posixQuote('/home/$USER/cfg')).toBe("'/home/$USER/cfg'");
  });

  it('leaves a backtick literal', () => {
    expect(posixQuote('/home/`whoami`/cfg')).toBe("'/home/`whoami`/cfg'");
  });

  it('leaves a backslash literal', () => {
    expect(posixQuote('/home/u\\cfg')).toBe("'/home/u\\cfg'");
  });

  it('leaves a double quote literal', () => {
    expect(posixQuote('/home/u/"cfg"')).toBe('\'/home/u/"cfg"\'');
  });

  it('escapes an embedded single quote by closing and reopening the quoting', () => {
    expect(posixQuote("/home/O'Brien/cfg")).toBe("'/home/O'\\''Brien/cfg'");
  });
});
