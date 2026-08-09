import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { ExploreTruthDocument } from './explore-truth-document';
import { parseExploreTruth } from './parse-explore-truth';

const VALID: Record<string, unknown> = {
  role: 'explore',
  files: [{ id: 'mode', path: 'src/mode.js', keywords: ['mode', 'flag'] }],
  relationships: [{ id: 'engine-reads-mode', keywords: ['engine', 'mode'] }],
};

describe('parseExploreTruth', () => {
  it('reads a well-formed explore truth document', () => {
    const truth: ExploreTruthDocument = parseExploreTruth(VALID, 'truth.json');

    expect(truth.role).toBe('explore');
    expect(truth.files[0]?.path).toBe('src/mode.js');
    expect(truth.files[0]?.keywords).toEqual(['mode', 'flag']);
    expect(truth.relationships[0]?.keywords).toEqual(['engine', 'mode']);
  });

  it('rejects an expected file with no relevance keywords', () => {
    expect(() =>
      parseExploreTruth(
        { ...VALID, files: [{ id: 'mode', path: 'src/mode.js' }] },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects files that are not a list', () => {
    expect(() =>
      parseExploreTruth({ ...VALID, files: 'src/mode.js' }, 'truth.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects relationships that are not a list', () => {
    expect(() =>
      parseExploreTruth({ ...VALID, relationships: null }, 'truth.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects an expected file with no path', () => {
    expect(() =>
      parseExploreTruth({ ...VALID, files: [{ id: 'a' }] }, 'truth.json'),
    ).toThrow(BenchFixtureError);
  });

  it('accepts a clean fixture with nothing to find', () => {
    const truth: ExploreTruthDocument = parseExploreTruth(
      { role: 'explore', files: [], relationships: [] },
      'truth.json',
    );

    expect(truth.files).toEqual([]);
  });
});
