import { describe, expect, it } from 'vitest';
import { END_TOKEN } from './end-token';

describe('END_TOKEN', () => {
  it('closes an omd region', () => {
    expect(END_TOKEN).toBe('omd:end');
  });

  it('is namespaced to omd so foreign markers never match', () => {
    expect(END_TOKEN.startsWith('omd:')).toBe(true);
  });
});
