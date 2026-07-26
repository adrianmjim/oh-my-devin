import { describe, expect, it } from 'vitest';
import { END_ID_PATTERN } from './end-id-pattern';

describe('END_ID_PATTERN', () => {
  it('captures the region id of an end sentinel', () => {
    expect(END_ID_PATTERN.exec('<!-- omd:end id=rules -->')?.[1]).toBe('rules');
  });

  it('does not match a sentinel carrying no id', () => {
    expect(END_ID_PATTERN.exec('<!-- omd:end -->')).toBeNull();
  });
});
