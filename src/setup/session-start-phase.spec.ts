import { describe, expect, it } from 'vitest';
import { SESSION_START_PHASE } from './session-start-phase';

describe('SESSION_START_PHASE', () => {
  it('names the phase the hook script receives at session start', () => {
    expect(SESSION_START_PHASE).toBe('session-start');
  });
});
