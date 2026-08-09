import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { DocumentSpecialistTruthDocument } from './document-specialist-truth-document';
import { parseDocumentSpecialistTruth } from './parse-document-specialist-truth';

const VALID: Record<string, unknown> = {
  role: 'document-specialist',
  answers: [
    {
      id: 'ceiling',
      keywords: ['five', 'attempts'],
      source: 'docs/retries.md',
    },
  ],
};

describe('parseDocumentSpecialistTruth', () => {
  it('reads a well-formed research truth document', () => {
    const truth: DocumentSpecialistTruthDocument =
      parseDocumentSpecialistTruth(VALID, 'truth.json');

    expect(truth.role).toBe('document-specialist');
    expect(truth.answers[0]?.source).toBe('docs/retries.md');
  });

  it('rejects answers that are not a list', () => {
    expect(() =>
      parseDocumentSpecialistTruth(
        { role: 'document-specialist', answers: 2 },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects an expected answer naming no source', () => {
    expect(() =>
      parseDocumentSpecialistTruth(
        {
          role: 'document-specialist',
          answers: [{ id: 'a', keywords: ['k'] }],
        },
        'truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('accepts a clean fixture the corpus does not answer', () => {
    expect(
      parseDocumentSpecialistTruth(
        { role: 'document-specialist', answers: [] },
        'truth.json',
      ).answers,
    ).toEqual([]);
  });
});
