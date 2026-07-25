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
