import { describe, expect, it } from 'vitest';
import { VERSION_PATTERN } from './version-pattern';

describe('VERSION_PATTERN', () => {
  it('captures a semantic version out of a banner line', () => {
    expect(VERSION_PATTERN.exec('devin 3000.1.27 (build 9)')?.[1]).toBe(
      '3000.1.27',
    );
  });

  it('does not match a partial version', () => {
    expect(VERSION_PATTERN.exec('devin 3000.1')).toBeNull();
  });
});
