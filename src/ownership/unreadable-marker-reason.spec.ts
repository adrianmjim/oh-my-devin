import { describe, expect, it } from 'vitest';
import { UNREADABLE_MARKER_REASON } from './unreadable-marker-reason';

describe('UNREADABLE_MARKER_REASON', () => {
  it('states that the marker cannot be read', () => {
    expect(UNREADABLE_MARKER_REASON).toBe(
      'its omd region marker cannot be read',
    );
  });
});
