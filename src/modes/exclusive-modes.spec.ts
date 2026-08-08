import { describe, expect, it } from 'vitest';
import { EXCLUSIVE_MODES } from './exclusive-modes';

describe('EXCLUSIVE_MODES', () => {
  it('holds the work-driving trio', () => {
    expect(EXCLUSIVE_MODES).toEqual(['autopilot', 'ralph', 'team']);
  });

  it('holds every member as a mode name', () => {
    for (const mode of EXCLUSIVE_MODES) {
      expect(typeof mode).toBe('string');
    }
  });
});
