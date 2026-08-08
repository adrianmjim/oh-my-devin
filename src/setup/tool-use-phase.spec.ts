import { describe, expect, it } from 'vitest';
import { HOOK_PHASES } from './hook-phases';
import { TOOL_USE_PHASE } from './tool-use-phase';

describe('TOOL_USE_PHASE', () => {
  it('names the tool-use phase', () => {
    expect(TOOL_USE_PHASE).toBe('tool-use');
  });

  it('is one of the phases the deployed script covers', () => {
    expect(HOOK_PHASES).toContain(TOOL_USE_PHASE);
  });
});
