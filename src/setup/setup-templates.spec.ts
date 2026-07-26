import { describe, expect, it } from 'vitest';
import type { HooksEventMap } from './setup-templates';
import { buildHooksEventMap, PROJECT_HOOK_COMMAND } from './setup-templates';

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
  });
});

describe('PROJECT_HOOK_COMMAND', () => {
  it('invokes the hook script at its project-relative path', () => {
    expect(PROJECT_HOOK_COMMAND).toBe('node .devin/hooks/omd-mode.mjs');
  });
});
