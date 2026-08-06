import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { ExecutorTruthDocument } from './executor-truth-document';
import { parseExecutorTruth } from './parse-executor-truth';

describe('parseExecutorTruth', () => {
  it('parses the expected test claim and every verifiable criterion', () => {
    const document: ExecutorTruthDocument = parseExecutorTruth(
      {
        expectedTests: 'passed',
        criteria: [
          {
            id: 'guard-added',
            keywords: ['guard'],
            path: 'src/parse.js',
            contains: ['input == null'],
          },
        ],
      },
      'executor/add-guard/truth.json',
    );

    expect(document.role).toBe('executor');
    expect(document.expectedTests).toBe('passed');
    expect(document.criteria[0]?.contains).toEqual(['input == null']);
  });

  it('rejects an unknown test claim', () => {
    expect(() =>
      parseExecutorTruth({ expectedTests: 'skipped', criteria: [] }, 'x'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects an empty criteria set so a run is always verifiable', () => {
    expect(() =>
      parseExecutorTruth({ expectedTests: 'passed', criteria: [] }, 'x'),
    ).toThrow(/criteria/);
  });

  it('rejects a criterion with no path', () => {
    expect(() =>
      parseExecutorTruth(
        {
          expectedTests: 'passed',
          criteria: [{ id: 'a', keywords: ['a'], contains: ['b'] }],
        },
        'x',
      ),
    ).toThrow(BenchFixtureError);
  });
});
