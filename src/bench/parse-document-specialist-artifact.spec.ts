import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { DocumentSpecialistArtifact } from './document-specialist-artifact';
import { parseDocumentSpecialistArtifact } from './parse-document-specialist-artifact';

describe('parseDocumentSpecialistArtifact', () => {
  it('reads each answer with the source it names', () => {
    const artifact: DocumentSpecialistArtifact =
      parseDocumentSpecialistArtifact(
        {
          answers: [
            {
              question: 'How many attempts?',
              answer: 'Five attempts, then the dead-letter table',
              source: 'docs/retries.md',
            },
          ],
        },
        'sample.json',
      );

    expect(artifact.answers[0]?.text).toContain('Five attempts');
    expect(artifact.answers[0]?.source).toBe('docs/retries.md');
  });

  it('reads an honest not-found brief', () => {
    expect(
      parseDocumentSpecialistArtifact(
        {
          answers: [],
          notFound: { sourcesConsulted: ['docs/ read in full'] },
        },
        'sample.json',
      ).answers,
    ).toEqual([]);
  });

  it('rejects answers that are not a list', () => {
    expect(() =>
      parseDocumentSpecialistArtifact({ answers: {} }, 'sample.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects an unsourced answer', () => {
    expect(() =>
      parseDocumentSpecialistArtifact(
        { answers: [{ question: 'q', answer: 'a' }] },
        'sample.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
