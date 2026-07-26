import { describe, expect, it } from 'vitest';
import { PINNED_DEVIN_VERSION } from './pinned-devin-version';
import { VERSION_PATTERN } from './version-pattern';

describe('PINNED_DEVIN_VERSION', () => {
  it('pins the devin version the layer is verified against', () => {
    expect(PINNED_DEVIN_VERSION).toBe('3000.1.27');
  });

  it('is a version the doctor can detect', () => {
    expect(VERSION_PATTERN.test(PINNED_DEVIN_VERSION)).toBe(true);
  });
});
