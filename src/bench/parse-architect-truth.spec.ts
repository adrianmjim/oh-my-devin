import { describe, expect, it } from 'vitest';
import type { ArchitectTruthDocument } from './architect-truth-document';
import { BenchFixtureError } from './bench-fixture-error';
import { parseArchitectTruth } from './parse-architect-truth';

describe('parseArchitectTruth', () => {
  it('parses every known gap a plan must close', () => {
    const document: ArchitectTruthDocument = parseArchitectTruth(
      { gaps: [{ id: 'no-rollback', keywords: ['rollback', 'revert'] }] },
      'architect/rename-column/truth.json',
    );

    expect(document.role).toBe('architect');
    expect(document.gaps).toEqual([
      { id: 'no-rollback', keywords: ['rollback', 'revert'] },
    ]);
  });

  it('parses the steps a plan must not take', () => {
    const document: ArchitectTruthDocument = parseArchitectTruth(
      {
        gaps: [{ id: 'no-rollback', keywords: ['rollback'] }],
        spurious: [{ id: 'rewrite-auth', keywords: ['rewrite', 'auth'] }],
      },
      'architect/rename-column/truth.json',
    );

    expect(document.spurious).toEqual([
      { id: 'rewrite-auth', keywords: ['rewrite', 'auth'] },
    ]);
  });

  it('defaults an absent spurious list to empty', () => {
    expect(
      parseArchitectTruth({ gaps: [] }, 'architect/clean/truth.json').spurious,
    ).toEqual([]);
  });

  it('rejects a non-array spurious field', () => {
    expect(() =>
      parseArchitectTruth({ gaps: [], spurious: 'none' }, 'x'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a non-array gaps field, naming the source', () => {
    expect(() =>
      parseArchitectTruth({ gaps: 'none' }, 'architect/x/truth.json'),
    ).toThrow(BenchFixtureError);
    expect(() =>
      parseArchitectTruth({ gaps: 'none' }, 'architect/x/truth.json'),
    ).toThrow(/architect\/x\/truth\.json/);
  });

  it('rejects a gap with no id', () => {
    expect(() => parseArchitectTruth({ gaps: [{ keywords: ['a'] }] }, 'x')).toThrow(
      BenchFixtureError,
    );
  });
});
