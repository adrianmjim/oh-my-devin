import { describe, expect, it } from 'vitest';
import type { ArchitectArtifact } from './architect-artifact';
import { BenchFixtureError } from './bench-fixture-error';
import { parseArchitectArtifact } from './parse-architect-artifact';

describe('parseArchitectArtifact', () => {
  it('narrows a schema-valid plan to the typed artifact', () => {
    const artifact: ArchitectArtifact = parseArchitectArtifact(
      {
        approach: 'Rename the column behind a migration',
        steps: [
          { description: 'Add the migration', files: ['db/0002.sql'] },
          { description: 'Backfill the new column' },
        ],
        risks: ['ignored by the bench'],
      },
      'architecture.json',
    );

    expect(artifact.approach).toBe('Rename the column behind a migration');
    expect(artifact.steps[0]?.files).toEqual(['db/0002.sql']);
  });

  it('defaults a step with no files to an empty list', () => {
    expect(
      parseArchitectArtifact(
        { approach: 'a', steps: [{ description: 'b' }] },
        'architecture.json',
      ).steps[0]?.files,
    ).toEqual([]);
  });

  it('rejects a missing approach, naming the source', () => {
    expect(() =>
      parseArchitectArtifact(
        { steps: [{ description: 'b' }] },
        'architecture.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      parseArchitectArtifact(
        { steps: [{ description: 'b' }] },
        'architecture.json',
      ),
    ).toThrow('architecture.json');
  });

  it('rejects a step with no description', () => {
    expect(() =>
      parseArchitectArtifact(
        { approach: 'a', steps: [{ files: [] }] },
        'architecture.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
