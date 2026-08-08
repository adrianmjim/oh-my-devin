import { describe, expect, it } from 'vitest';
import type { ArchitectArtifact } from './architect-artifact';
import type { ArchitectTruthDocument } from './architect-truth-document';
import type { BenchDimension } from './bench-dimension';
import type { DimensionScore } from './dimension-score';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreArchitect } from './score-architect';

const TRUTH: ArchitectTruthDocument = {
  role: 'architect',
  gaps: [
    { id: 'no-migration', keywords: ['migration', 'column'] },
    { id: 'no-backfill', keywords: ['backfill'] },
  ],
  spurious: [{ id: 'rewrite-auth', keywords: ['rewrite', 'auth'] }],
};

function scoreOf(
  scores: readonly DimensionScore[],
  dimension: BenchDimension,
): number {
  return (
    scores.find(
      (score: DimensionScore): boolean => score.dimension === dimension,
    )?.score ?? Number.NaN
  );
}

describe('scoreArchitect', () => {
  it('scores the fraction of known gaps the plan closes', () => {
    const artifact: ArchitectArtifact = {
      approach: 'Rename behind a migration',
      steps: [
        {
          description: 'Add a migration renaming the column',
          files: ['db/0002.sql'],
        },
      ],
    };

    const scores: readonly DimensionScore[] = scoreArchitect(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'gap-coverage')).toBe(0.5);
  });

  it('scores a plan covering every gap as full coverage', () => {
    const artifact: ArchitectArtifact = {
      approach: 'Rename behind a migration',
      steps: [
        { description: 'Add a migration renaming the column', files: [] },
        { description: 'Backfill the new column from the old one', files: [] },
      ],
    };

    const scores: readonly DimensionScore[] = scoreArchitect(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'gap-coverage')).toBe(1);
    expect(scoreOf(scores, 'spurious-step-resistance')).toBe(1);
  });

  it('scores a plan that takes a step the truth rules out', () => {
    const artifact: ArchitectArtifact = {
      approach: 'Rename behind a migration',
      steps: [
        { description: 'Add a migration renaming the column', files: [] },
        { description: 'Backfill the new column', files: [] },
        { description: 'Rewrite the auth module while we are here', files: [] },
      ],
    };

    const scores: readonly DimensionScore[] = scoreArchitect(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'spurious-step-resistance')).toBe(0);
    expect(scoreOf(scores, 'gap-coverage')).toBe(1);
  });

  it('does not penalise ordinary steps the truth never names', () => {
    const artifact: ArchitectArtifact = {
      approach: 'Rename behind a migration',
      steps: [
        { description: 'Add a migration renaming the column', files: [] },
        { description: 'Backfill the new column', files: [] },
        { description: 'Update the changelog', files: ['CHANGELOG.md'] },
      ],
    };

    const scores: readonly DimensionScore[] = scoreArchitect(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'spurious-step-resistance')).toBe(1);
  });

  it('scores a clean-baseline truth with no gaps as full coverage', () => {
    const clean: ArchitectTruthDocument = {
      role: 'architect',
      gaps: [],
      spurious: [],
    };

    const scores: readonly DimensionScore[] = scoreArchitect(
      { approach: 'a', steps: [{ description: 'b', files: [] }] },
      clean,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'gap-coverage')).toBe(1);
    expect(scoreOf(scores, 'spurious-step-resistance')).toBe(1);
  });

  it('counts a gap covered only when a step closes it, never the approach', () => {
    const artifact: ArchitectArtifact = {
      approach: 'Backfill after the migration renames the column',
      steps: [{ description: 'Ship it', files: [] }],
    };

    const scores: readonly DimensionScore[] = scoreArchitect(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'gap-coverage')).toBe(0);
  });

  it('keeps resistance when the approach names the rejected alternative', () => {
    const artifact: ArchitectArtifact = {
      approach:
        'Rename the column in place rather than rewrite the auth module',
      steps: [
        { description: 'Add a migration renaming the column', files: [] },
        { description: 'Backfill the new column', files: [] },
      ],
    };

    const scores: readonly DimensionScore[] = scoreArchitect(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'spurious-step-resistance')).toBe(1);
    expect(scoreOf(scores, 'gap-coverage')).toBe(1);
  });

  it('is deterministic: the same plan scored twice yields the same scores', () => {
    const artifact: ArchitectArtifact = {
      approach: 'Rename behind a migration',
      steps: [
        { description: 'Add a migration renaming the column', files: [] },
        { description: 'Rewrite the auth module', files: [] },
      ],
    };

    expect(scoreArchitect(artifact, TRUTH, KEYWORD_MATCH_THRESHOLD)).toEqual(
      scoreArchitect(artifact, TRUTH, KEYWORD_MATCH_THRESHOLD),
    );
  });

  it('reports its dimensions in the architect weight-set order', () => {
    const scores: readonly DimensionScore[] = scoreArchitect(
      { approach: 'a', steps: [{ description: 'b', files: [] }] },
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(
      scores.map((score: DimensionScore): BenchDimension => score.dimension),
    ).toEqual(['gap-coverage', 'spurious-step-resistance']);
  });
});
