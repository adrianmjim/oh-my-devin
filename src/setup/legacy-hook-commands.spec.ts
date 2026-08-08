import { describe, expect, it } from 'vitest';
import { legacyHookCommands } from './legacy-hook-commands';

describe('legacyHookCommands', () => {
  it('renders the double-quoted per-phase commands the previous release installed', () => {
    expect(
      legacyHookCommands('/home/u/.config/devin/hooks/omd-mode.mjs'),
    ).toEqual([
      'node "/home/u/.config/devin/hooks/omd-mode.mjs" session-start',
      'node "/home/u/.config/devin/hooks/omd-mode.mjs" user-prompt',
      'node "/home/u/.config/devin/hooks/omd-mode.mjs" stop',
      'node "/home/u/.config/devin/hooks/omd-mode.mjs" tool-use',
    ]);
  });
});
