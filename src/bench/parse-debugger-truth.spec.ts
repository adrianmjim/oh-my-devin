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
      parseDebuggerTruth({ role: 'debugger', causes: [] }, 'truth.json').causes,
    ).toEqual([]);
  });
});
