import { describe, expect, it } from 'vitest';
import { buildHooksEventMap } from './build-hooks-event-map';
import type { HooksEventMap } from './hooks-event-map';

describe('buildHooksEventMap', () => {
  it('claims each event with exactly one command entry for its phase', () => {
    const map: HooksEventMap = buildHooksEventMap('node run.mjs');

    expect(map.SessionStart).toEqual([
      { hooks: [{ type: 'command', command: 'node run.mjs session-start' }] },
    ]);
    expect(map.UserPromptSubmit).toEqual([
      { hooks: [{ type: 'command', command: 'node run.mjs user-prompt' }] },
    ]);
    expect(map.Stop).toEqual([
      { hooks: [{ type: 'command', command: 'node run.mjs stop' }] },
    ]);
    expect(map.PreToolUse).toEqual([
      { hooks: [{ type: 'command', command: 'node run.mjs tool-use' }] },
    ]);
  });
});
