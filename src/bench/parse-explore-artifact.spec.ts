import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { ExploreArtifact } from './explore-artifact';
import { parseExploreArtifact } from './parse-explore-artifact';

describe('parseExploreArtifact', () => {
  it('reads the paths and the relationships', () => {
    const artifact: ExploreArtifact = parseExploreArtifact(
      {
        findings: [{ path: 'src/mode.js', relevance: 'Decides the mode' }],
        relationships: [
          {
            from: 'src/engine.js',
            to: 'src/mode.js',
            relationship: 'reads the mode from',
          },
        ],
      },
      'sample.json',
    );

    expect(artifact.paths).toEqual(['src/mode.js']);
    expect(artifact.relationships[0]).toContain('reads the mode');
  });

  it('reads an honest empty-handed map', () => {
    const artifact: ExploreArtifact = parseExploreArtifact(
      {
        findings: [],
        relationships: [],
        nothingFound: { searched: ['src for telemetry'] },
      },
      'sample.json',
    );

    expect(artifact.paths).toEqual([]);
  });

  it('tolerates an omitted relationships list', () => {
    expect(
      parseExploreArtifact(
        { findings: [{ path: 'a.js', relevance: 'r' }] },
        'sample.json',
      ).relationships,
    ).toEqual([]);
  });

  it('rejects findings that are not a list', () => {
    expect(() =>
      parseExploreArtifact({ findings: {} }, 'sample.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a finding with no relevance', () => {
    expect(() =>
      parseExploreArtifact(
        { findings: [{ path: 'a.js' }] },
        'sample.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
