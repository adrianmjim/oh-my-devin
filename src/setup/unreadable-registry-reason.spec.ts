import { describe, expect, it } from 'vitest';
import { UNREADABLE_REGISTRY_REASON } from './unreadable-registry-reason';

describe('UNREADABLE_REGISTRY_REASON', () => {
  it('states that the registry is not a JSON object omd can read', () => {
    expect(UNREADABLE_REGISTRY_REASON).toBe(
      'it is not a JSON object omd can read',
    );
  });
});
