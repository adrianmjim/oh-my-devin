import { describe, expect, it } from 'vitest';
import { isOmdHookEntry } from './is-omd-hook-entry';
import { posixQuote } from './posix-quote';

const INSTALLED_COMMANDS: ReadonlySet<string> = new Set<string>([
  'node .devin/hooks/omd-mode.mjs session-start',
  'node .devin/hooks/omd-mode.mjs user-prompt',
  'node .devin/hooks/omd-mode.mjs stop',
]);

const APOSTROPHE_SCRIPT: string =
  "/home/O'Brien/.config/devin/hooks/omd-mode.mjs";

describe('isOmdHookEntry', () => {
  it('recognizes an entry running an installed command', () => {
    expect(
      isOmdHookEntry(
        {
          hooks: [
            { type: 'command', command: 'node .devin/hooks/omd-mode.mjs stop' },
          ],
        },
        INSTALLED_COMMANDS,
      ),
    ).toBe(true);
  });

  it('recognizes an installed command whose quoted path carries an apostrophe', () => {
    const command: string = `node ${posixQuote(APOSTROPHE_SCRIPT)} stop`;

    expect(
      isOmdHookEntry(
        { hooks: [{ type: 'command', command }] },
        new Set<string>([command]),
      ),
    ).toBe(true);
  });

  it('does not recognize the hook script installed at a foreign path', () => {
    expect(
      isOmdHookEntry(
        {
          hooks: [
            { type: 'command', command: 'node /opt/acme/omd-mode.mjs stop' },
          ],
        },
        INSTALLED_COMMANDS,
      ),
    ).toBe(false);
  });

  it('does not recognize a command that departs from an installed one', () => {
    const commands: readonly string[] = [
      'node ./scripts/backup-omd-mode.mjs session-start',
      'echo omd-mode.mjs',
      'rm .devin/hooks/omd-mode.mjs',
      'node .devin/hooks/omd-mode.mjs stop && node ./scripts/mine.mjs',
      'node .devin/hooks/omd-mode.mjs',
      'node .devin/hooks/omd-mode.mjs deploy',
      'node --inspect .devin/hooks/omd-mode.mjs stop',
    ];

    for (const command of commands) {
      expect(
        isOmdHookEntry(
          { hooks: [{ type: 'command', command }] },
          INSTALLED_COMMANDS,
        ),
        command,
      ).toBe(false);
    }
  });

  it('does not recognize a hook that is not command-typed', () => {
    expect(
      isOmdHookEntry(
        { hooks: [{ command: 'node .devin/hooks/omd-mode.mjs stop' }] },
        INSTALLED_COMMANDS,
      ),
    ).toBe(false);
  });

  it('does not recognize an entry mixing an installed command with a foreign one', () => {
    expect(
      isOmdHookEntry(
        {
          hooks: [
            { type: 'command', command: 'node .devin/hooks/omd-mode.mjs stop' },
            { type: 'command', command: 'node ./scripts/my-guard.mjs' },
          ],
        },
        INSTALLED_COMMANDS,
      ),
    ).toBe(false);
  });

  it('does not recognize an entry holding no hooks', () => {
    expect(isOmdHookEntry({ hooks: [] }, INSTALLED_COMMANDS)).toBe(false);
  });

  it('does not recognize a shape it cannot read', () => {
    const foreign: readonly unknown[] = [
      null,
      'a string',
      42,
      [],
      {},
      { hooks: 'not a list' },
      { hooks: [{ type: 'command' }] },
      { hooks: [null] },
    ];

    for (const entry of foreign) {
      expect(isOmdHookEntry(entry, INSTALLED_COMMANDS)).toBe(false);
    }
  });
});
