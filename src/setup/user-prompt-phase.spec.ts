import { describe, expect, it } from 'vitest';
import { USER_PROMPT_PHASE } from './user-prompt-phase';

describe('USER_PROMPT_PHASE', () => {
  it('names the phase the hook script receives on a user prompt', () => {
    expect(USER_PROMPT_PHASE).toBe('user-prompt');
  });
});
