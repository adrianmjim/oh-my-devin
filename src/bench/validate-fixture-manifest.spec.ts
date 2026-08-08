import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { FixtureManifest } from './fixture-manifest';
import { validateFixtureManifest } from './validate-fixture-manifest';

const MANIFEST = {
  role: 'reviewer',
  hypothesis:
    'The reviewer prompt makes severity track impact rather than effort.',
  fixtures: [
    { id: 'null-deref', clean: false },
    { id: 'clean-refactor', clean: true },
  ],
};

describe('validateFixtureManifest', () => {
  it('accepts a well-formed manifest', () => {
    const manifest: FixtureManifest = validateFixtureManifest(
      MANIFEST,
      'reviewer/manifest.json',
    );

    expect(manifest.role).toBe('reviewer');
    expect(manifest.hypothesis).toBe(MANIFEST.hypothesis);
    expect(manifest.fixtures.map((entry) => entry.id)).toEqual([
      'null-deref',
      'clean-refactor',
    ]);
  });

  it('rejects a missing required field, naming the source and the field', () => {
    expect(() =>
      validateFixtureManifest(
        { role: 'reviewer', hypothesis: MANIFEST.hypothesis },
        'reviewer/manifest.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      validateFixtureManifest(
        { role: 'reviewer', hypothesis: MANIFEST.hypothesis },
        'reviewer/manifest.json',
      ),
    ).toThrow(/reviewer\/manifest\.json.*fixtures/);
  });

  it('rejects an empty hypothesis so every bench names what it answers', () => {
    expect(() =>
      validateFixtureManifest(
        { ...MANIFEST, hypothesis: '   ' },
        'reviewer/manifest.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      validateFixtureManifest(
        { ...MANIFEST, hypothesis: '   ' },
        'reviewer/manifest.json',
      ),
    ).toThrow(/hypothesis/);
  });

  it('rejects an empty fixture set', () => {
    expect(() =>
      validateFixtureManifest(
        { ...MANIFEST, fixtures: [] },
        'reviewer/manifest.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a duplicate fixture id', () => {
    expect(() =>
      validateFixtureManifest(
        {
          ...MANIFEST,
          fixtures: [
            { id: 'null-deref', clean: false },
            { id: 'null-deref', clean: true },
          ],
        },
        'reviewer/manifest.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a non-boolean clean flag', () => {
    expect(() =>
      validateFixtureManifest(
        { ...MANIFEST, fixtures: [{ id: 'null-deref', clean: 'no' }] },
        'reviewer/manifest.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
