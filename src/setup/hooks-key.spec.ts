import { describe, expect, it } from 'vitest';
import { HOOKS_KEY } from './hooks-key';

describe('HOOKS_KEY', () => {
  it('names the registry key holding the event map', () => {
    expect(HOOKS_KEY).toBe('hooks');
  });
});
