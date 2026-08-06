import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { ExecutorTruthDocument } from './executor-truth-document';
import { parseExecutorTruth } from './parse-executor-truth';

const CRITERIA: readonly Record<string, unknown>[] = [
  {
    id: 'guard-added',
    keywords: ['guard'],
    path: 'src/parse.js',
    contains: ['input == null'],
  },
];

describe('parseExecutorTruth', () => {
  it('parses the claim, the criteria, the verification and the protected paths', () => {
    const document: ExecutorTruthDocument = parseExecutorTruth(
      {
        expectedTests: 'passed',
        criteria: CRITERIA,
        verification: { command: 'node', args: ['--test'] },
        protectedPaths: ['test/parse.test.js'],
      },
      'executor/add-guard/truth.json',
    );

    expect(document.role).toBe('executor');
    expect(document.expectedTests).toBe('passed');
    expect(document.criteria[0]?.contains).toEqual(['input == null']);
    expect(document.verification).toEqual({ command: 'node', args: ['--test'] });
    expect(document.protectedPaths).toEqual(['test/parse.test.js']);
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

  it('rejects a truth with no verification command', () => {
    expect(() =>
      parseExecutorTruth(
        {
          expectedTests: 'passed',
          criteria: CRITERIA,
          protectedPaths: [],
        },
        'x',
      ),
    ).toThrow(/verification/);
  });

  it('rejects a truth with no protected paths field', () => {
    expect(() =>
      parseExecutorTruth(
        {
          expectedTests: 'passed',
          criteria: CRITERIA,
          verification: { command: 'node', args: ['--test'] },
        },
        'x',
      ),
    ).toThrow(/protectedPaths/);
  });
});
