import { describe, expect, it } from 'vitest';
import { buildHooksEventMap } from './build-hooks-event-map';
import { HOOKS_MAP } from './hooks-map';
import { PROJECT_HOOK_COMMAND } from './project-hook-command';

describe('HOOKS_MAP', () => {
  it('serializes the project-level event map', () => {
    expect(JSON.parse(HOOKS_MAP)).toEqual(
      buildHooksEventMap(PROJECT_HOOK_COMMAND),
    );
  });

  it('is indented and newline-terminated so the installed file reads well', () => {
    expect(HOOKS_MAP).toContain('\n  ');
    expect(HOOKS_MAP.endsWith('\n')).toBe(true);
  });
});
