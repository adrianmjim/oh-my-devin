import { describe, expect, it } from 'vitest';
import { STOP_PHASE } from './stop-phase';

describe('STOP_PHASE', () => {
  it('names the phase the hook script receives when a turn stops', () => {
    expect(STOP_PHASE).toBe('stop');
  });
});
