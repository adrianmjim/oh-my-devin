import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { FixtureManifestEntry } from './fixture-manifest-entry';
import { parseFixtureManifestEntry } from './parse-fixture-manifest-entry';

describe('parseFixtureManifestEntry', () => {
  it('parses a fixture id and its clean flag', () => {
    const entry: FixtureManifestEntry = parseFixtureManifestEntry(
      { id: 'null-deref', clean: false },
      'reviewer/manifest.json#fixtures[0]',
    );

    expect(entry).toEqual({ id: 'null-deref', clean: false });
  });

  it('rejects a non-boolean clean flag, naming the source', () => {
    expect(() =>
      parseFixtureManifestEntry({ id: 'a', clean: 'no' }, 'm#fixtures[0]'),
    ).toThrow(BenchFixtureError);
    expect(() =>
      parseFixtureManifestEntry({ id: 'a', clean: 'no' }, 'm#fixtures[0]'),
    ).toThrow('m#fixtures[0].clean');
  });

  it('rejects a missing id', () => {
    expect(() =>
      parseFixtureManifestEntry({ clean: true }, 'm#fixtures[0]'),
    ).toThrow(BenchFixtureError);
  });
});
