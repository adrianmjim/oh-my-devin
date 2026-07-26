import { describe, expect, it } from 'vitest';
import { artifactState } from './artifact-state';

describe('artifactState', () => {
  it('reads as pending while validation has not run', () => {
    expect(artifactState(null)).toBe('pending');
  });

  it('reads as valid or invalid once validation ran', () => {
    expect(artifactState(true)).toBe('valid');
    expect(artifactState(false)).toBe('invalid');
  });
});
