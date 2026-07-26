import { describe, expect, it } from 'vitest';
import { EDITED_REASON } from './edited-reason';

describe('EDITED_REASON', () => {
  it('states that the region changed since it was installed', () => {
    expect(EDITED_REASON).toBe(
      'its omd region has been edited since it was installed',
    );
  });
});
