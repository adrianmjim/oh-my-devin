import { describe, expect, it } from 'vitest';
import { isOmdHookEntry } from './is-omd-hook-entry';

describe('isOmdHookEntry', () => {
  it('recognizes an entry invoking the hook script by a relative command', () => {
    expect(
      isOmdHookEntry({
        hooks: [
          { type: 'command', command: 'node .devin/hooks/omd-mode.mjs stop' },
        ],
      }),
    ).toBe(true);
  });

  it('recognizes an entry invoking the hook script by an absolute command', () => {
    expect(
      isOmdHookEntry({
        hooks: [
          {
            type: 'command',
            command: 'node "/home/dev/.devin/hooks/omd-mode.mjs" session-start',
          },
        ],
      }),
    ).toBe(true);
  });

  it('recognizes an entry whose quoted script path carries spaces', () => {
    expect(
      isOmdHookEntry({
        hooks: [
          {
            type: 'command',
            command:
              "node '/home/John Doe/.config/devin/hooks/omd-mode.mjs' user-prompt",
          },
        ],
      }),
    ).toBe(true);
  });

  it('does not recognize a foreign script whose name ends with the hook script filename', () => {
    expect(
      isOmdHookEntry({
        hooks: [
          {
            type: 'command',
            command: 'node ./scripts/backup-omd-mode.mjs session-start',
          },
        ],
      }),
    ).toBe(false);
  });

  it('does not recognize a command that merely names the script without invoking it', () => {
    const commands: readonly string[] = [
      'echo omd-mode.mjs',
      'rm .devin/hooks/omd-mode.mjs',
      "sh -c 'node .devin/hooks/omd-mode.mjs && node ./scripts/mine.mjs'",
    ];

    for (const command of commands) {
      expect(
        isOmdHookEntry({ hooks: [{ type: 'command', command }] }),
        command,
      ).toBe(false);
    }
  });

  it('does not recognize an invocation altered beyond the script and its phase', () => {
    const commands: readonly string[] = [
      'node .devin/hooks/omd-mode.mjs stop && node ./scripts/mine.mjs',
      'node .devin/hooks/omd-mode.mjs',
      'node .devin/hooks/omd-mode.mjs deploy',
      'node --inspect .devin/hooks/omd-mode.mjs stop',
    ];

    for (const command of commands) {
      expect(
        isOmdHookEntry({ hooks: [{ type: 'command', command }] }),
        command,
      ).toBe(false);
    }
  });

  it('does not recognize a hook that is not command-typed', () => {
    expect(
      isOmdHookEntry({
        hooks: [{ command: 'node .devin/hooks/omd-mode.mjs stop' }],
      }),
    ).toBe(false);
  });

  it('does not recognize a foreign entry', () => {
    expect(
      isOmdHookEntry({
        hooks: [{ type: 'command', command: 'node ./scripts/my-guard.mjs' }],
      }),
    ).toBe(false);
  });

  it('does not recognize an entry mixing an omd command with a foreign one', () => {
    expect(
      isOmdHookEntry({
        hooks: [
          { type: 'command', command: 'node .devin/hooks/omd-mode.mjs stop' },
          { type: 'command', command: 'node ./scripts/my-guard.mjs' },
        ],
      }),
    ).toBe(false);
  });

  it('does not recognize an entry holding no hooks', () => {
    expect(isOmdHookEntry({ hooks: [] })).toBe(false);
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
      expect(isOmdHookEntry(entry)).toBe(false);
    }
  });
});
