import { describe, expect, it } from 'vitest';
import { EXCLUDED_LAYOUT_DIRS } from './excluded-layout-dirs';

describe('EXCLUDED_LAYOUT_DIRS', () => {
  it('keeps installed dependencies out of the layout', () => {
    expect(EXCLUDED_LAYOUT_DIRS).toContain('node_modules');
  });
});
