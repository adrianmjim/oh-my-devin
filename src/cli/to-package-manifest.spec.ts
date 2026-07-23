import { describe, expect, it } from 'vitest';
import type { PackageManifest } from './package-manifest';
import { toPackageManifest } from './to-package-manifest';

describe('toPackageManifest', () => {
  it('accepts an object carrying a non-empty string version', () => {
    const manifest: PackageManifest = toPackageManifest({ version: '1.2.3' });

    expect(manifest.version).toBe('1.2.3');
  });

  it('rejects null', () => {
    expect(() => toPackageManifest(null)).toThrow(
      'package manifest must be a JSON object',
    );
  });

  it('rejects a non-object value', () => {
    expect(() => toPackageManifest('1.2.3')).toThrow(
      'package manifest must be a JSON object',
    );
  });

  it('rejects an array', () => {
    expect(() => toPackageManifest(['1.2.3'])).toThrow(
      'package manifest must be a JSON object',
    );
  });

  it('rejects a manifest without a version', () => {
    expect(() => toPackageManifest({})).toThrow(
      'package manifest is missing a string "version"',
    );
  });

  it('rejects a non-string version', () => {
    expect(() => toPackageManifest({ version: 3 })).toThrow(
      'package manifest is missing a string "version"',
    );
  });

  it('rejects an empty version', () => {
    expect(() => toPackageManifest({ version: '' })).toThrow(
      'package manifest is missing a string "version"',
    );
  });
});
