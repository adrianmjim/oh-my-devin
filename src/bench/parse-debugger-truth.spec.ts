import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { DebuggerTruthDocument } from './debugger-truth-document';
import { parseDebuggerTruth } from './parse-debugger-truth';

const VALID: Record<string, unknown> = {
  role: 'debugger',
  causes: [
    {
      id: 'early-read',
      keywords: ['resume', 'id', 'before'],
      location: 'src/session.js:12',
    },
  ],
  evidence: [],
  eliminations: [],
};

describe('parseDebuggerTruth', () => {
  it('reads a well-formed debugger truth document', () => {
    const truth: DebuggerTruthDocument = parseDebuggerTruth(
      VALID,
      'truth.json',
    );

    expect(truth.role).toBe('debugger');
    expect(truth.causes[0]?.location).toBe('src/session.js:12');
  });

  it('rejects causes that are not a list', () => {
    expect(() =>
      parseDebuggerTruth({ role: 'debugger', causes: 1 }, 'truth.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a cause naming no location to localise against', () => {
    expect(() =>
      parseDebuggerTruth(
        { role: 'debugger', causes: [{ id: 'a', keywords: ['k'] }] },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a cause with no keywords to pair on', () => {
    expect(() =>
      parseDebuggerTruth(
        {
          role: 'debugger',
          causes: [{ id: 'a', keywords: [], location: 'a.js:1' }],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('accepts a clean fixture whose failure has no planted cause', () => {
    expect(
      parseDebuggerTruth(
        { role: 'debugger', causes: [], evidence: [], eliminations: [] },
        'truth.json',
      ).causes,
    ).toEqual([]);
  });

  it('reads the expected evidence and eliminations of a clean fixture', () => {
    const truth: DebuggerTruthDocument = parseDebuggerTruth(
      {
        role: 'debugger',
        causes: [],
        evidence: [{ id: 'repeated-runs', keywords: ['test.js'] }],
        eliminations: [{ id: 'no-reproduction', keywords: ['reproduce'] }],
      },
      'truth.json',
    );

    expect(truth.evidence[0]?.id).toBe('repeated-runs');
    expect(truth.eliminations[0]?.keywords).toEqual(['reproduce']);
  });

  it('rejects expected evidence that is not a list', () => {
    expect(() =>
      parseDebuggerTruth(
        { role: 'debugger', causes: [], evidence: 1, eliminations: [] },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects an expected elimination with no keywords to pair on', () => {
    expect(() =>
      parseDebuggerTruth(
        {
          role: 'debugger',
          causes: [],
          evidence: [],
          eliminations: [{ id: 'no-reproduction', keywords: [] }],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
