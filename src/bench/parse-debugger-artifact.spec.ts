import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { DebuggerArtifact } from './debugger-artifact';
import { parseDebuggerArtifact } from './parse-debugger-artifact';

describe('parseDebuggerArtifact', () => {
  it('reads the evidence and an isolated cause', () => {
    const artifact: DebuggerArtifact = parseDebuggerArtifact(
      {
        evidence: [
          { source: 'node test.js', observation: 'throws on resume only' },
        ],
        rootCause: {
          location: 'src/session.js:12',
          explanation: 'The id is read before the resume branch assigns it',
          fixDirection: 'Assign it in both branches first',
        },
      },
      'sample.json',
    );

    expect(artifact.evidence[0]).toContain('node test.js');
    expect(artifact.rootCause?.location).toBe('src/session.js:12');
    expect(artifact.rootCause?.text).toContain('resume branch');
    expect(artifact.eliminated).toEqual([]);
  });

  it('reads an honest failure to isolate', () => {
    const artifact: DebuggerArtifact = parseDebuggerArtifact(
      {
        evidence: [{ source: 'node test.js', observation: 'fails sometimes' }],
        notIsolated: {
          eliminatedHypotheses: ['stale build: reproduces after a rebuild'],
        },
      },
      'sample.json',
    );

    expect(artifact.rootCause).toBeNull();
    expect(artifact.eliminated).toHaveLength(1);
  });

  it('rejects a diagnosis resting on no evidence', () => {
    expect(() =>
      parseDebuggerArtifact({ evidence: [] }, 'sample.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects evidence that is not a list', () => {
    expect(() =>
      parseDebuggerArtifact({ evidence: 'ran the test' }, 'sample.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a root cause with no fix direction', () => {
    expect(() =>
      parseDebuggerArtifact(
        {
          evidence: [{ source: 's', observation: 'o' }],
          rootCause: { location: 'a.js:1', explanation: 'e' },
        },
        'sample.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
