import { describe, expect, it } from 'vitest';
import type { DimensionScore } from './dimension-score';
import type { DocumentSpecialistArtifact } from './document-specialist-artifact';
import type { DocumentSpecialistTruthDocument } from './document-specialist-truth-document';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreDocumentSpecialist } from './score-document-specialist';

const TRUTH: DocumentSpecialistTruthDocument = {
  role: 'document-specialist',
  answers: [
    {
      id: 'ceiling',
      keywords: ['five', 'attempts'],
      source: 'docs/retries.md',
    },
    {
      id: 'dead-letter',
      keywords: ['dead', 'letter'],
      source: 'docs/retries.md',
    },
  ],
};

const CLEAN: DocumentSpecialistTruthDocument = {
  role: 'document-specialist',
  answers: [],
};

function scoreOf(scores: readonly DimensionScore[], dimension: string): number {
  return (
    scores.find((s: DimensionScore): boolean => s.dimension === dimension)
      ?.score ?? -1
  );
}

function score(
  artifact: DocumentSpecialistArtifact,
  truth: DocumentSpecialistTruthDocument,
) {
  return scoreDocumentSpecialist(artifact, truth, KEYWORD_MATCH_THRESHOLD);
}

describe('scoreDocumentSpecialist', () => {
  it('credits a sourced answer on both detection and attribution', () => {
    const scores: readonly DimensionScore[] = score(
      {
        answers: [
          {
            text: 'five attempts before it stops',
            source: 'docs/retries.md',
          },
          { text: 'it lands in the dead letter table', source: 'docs/retries.md' },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'source-attribution-accuracy')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('withholds attribution for a right answer citing the wrong source', () => {
    const scores: readonly DimensionScore[] = score(
      {
        answers: [
          { text: 'five attempts before it stops', source: 'docs/limits.md' },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(0.5);
    expect(scoreOf(scores, 'source-attribution-accuracy')).toBe(0);
  });

  it('counts an answer matching nothing as a false positive', () => {
    const scores: readonly DimensionScore[] = score(
      {
        answers: [
          { text: 'the logo is blue', source: 'docs/brand.md' },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('rewards an honest not-found brief on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score({ answers: [] }, CLEAN);

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'source-attribution-accuracy')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('penalises answering a question the corpus does not answer', () => {
    const scores: readonly DimensionScore[] = score(
      { answers: [{ text: 'it retries twice', source: 'docs/retries.md' }] },
      CLEAN,
    );

    expect(scoreOf(scores, 'detection')).toBe(0);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('scores the same inputs identically every time', () => {
    const artifact: DocumentSpecialistArtifact = {
      answers: [
        { text: 'five attempts before it stops', source: 'docs/retries.md' },
      ],
    };

    expect(score(artifact, TRUTH)).toEqual(score(artifact, TRUTH));
  });
});
