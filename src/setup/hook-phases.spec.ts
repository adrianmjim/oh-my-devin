import { describe, expect, it } from 'vitest';
import { HOOK_PHASES } from './hook-phases';
import { SESSION_START_PHASE } from './session-start-phase';
import { STOP_PHASE } from './stop-phase';
import { TOOL_USE_PHASE } from './tool-use-phase';
import { USER_PROMPT_PHASE } from './user-prompt-phase';

describe('HOOK_PHASES', () => {
  it('enumerates every phase the hook script answers', () => {
    expect(HOOK_PHASES).toEqual([
      SESSION_START_PHASE,
      USER_PROMPT_PHASE,
      STOP_PHASE,
      TOOL_USE_PHASE,
    ]);
  });

  it('holds no duplicate phase', () => {
    expect(new Set(HOOK_PHASES).size).toBe(HOOK_PHASES.length);
  });
});
