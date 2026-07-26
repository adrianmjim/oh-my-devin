import { describe, expect, it } from 'vitest';
import { HOOK_SCRIPT_FILENAME } from './hook-script-filename';
import { PROJECT_HOOK_COMMAND } from './project-hook-command';

describe('PROJECT_HOOK_COMMAND', () => {
  it('invokes the hook script at its project-relative path', () => {
    expect(PROJECT_HOOK_COMMAND).toBe('node .devin/hooks/omd-mode.mjs');
  });

  it('addresses the installed script by its filename', () => {
    expect(PROJECT_HOOK_COMMAND).toContain(HOOK_SCRIPT_FILENAME);
  });
});
