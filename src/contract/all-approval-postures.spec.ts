import { describe, expect, it } from 'vitest';
import { ALL_APPROVAL_POSTURES } from './all-approval-postures';

describe('ALL_APPROVAL_POSTURES', () => {
  it('lists every approval posture narrowest first', () => {
    expect(ALL_APPROVAL_POSTURES).toEqual([
      'artifact-write',
      'command-execution',
    ]);
  });
});
