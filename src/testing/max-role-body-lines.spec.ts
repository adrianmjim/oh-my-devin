import { describe, expect, it } from 'vitest';
import { MAX_ROLE_BODY_LINES } from './max-role-body-lines';

describe('MAX_ROLE_BODY_LINES', () => {
  it('caps a role body at the scale of the reference agent template', () => {
    expect(MAX_ROLE_BODY_LINES).toBe(120);
  });
});
