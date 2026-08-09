import { describe, expect, it } from 'vitest';
import { CLAIMED_EVENTS } from './claimed-events';

describe('CLAIMED_EVENTS', () => {
  it('claims the session events the layer hooks', () => {
    expect(CLAIMED_EVENTS).toEqual([
      'SessionStart',
      'UserPromptSubmit',
      'Stop',
      'PreToolUse',
    ]);
  });

  it('claims each event once', () => {
    expect(new Set(CLAIMED_EVENTS).size).toBe(CLAIMED_EVENTS.length);
  });
});
