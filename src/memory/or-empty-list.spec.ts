import { describe, expect, it } from 'vitest';
import { orEmptyList } from './or-empty-list';

describe('orEmptyList', () => {
  it('marks an empty list as none', () => {
    expect(orEmptyList([])).toBe('(none)');
  });

  it('joins the values it was given', () => {
    expect(orEmptyList(['node', 'typescript'])).toBe('node, typescript');
  });
});
