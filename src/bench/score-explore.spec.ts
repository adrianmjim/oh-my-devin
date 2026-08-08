import { describe, expect, it } from 'vitest';
import type { DimensionScore } from './dimension-score';
import type { ExploreArtifact } from './explore-artifact';
import type { ExploreTruthDocument } from './explore-truth-document';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreExplore } from './score-explore';

const TRUTH: ExploreTruthDocument = {
  role: 'explore',
  files: [
    { id: 'mode', path: 'src/mode.js' },
    { id: 'engine', path: 'src/engine.js' },
  ],
  relationships: [
    { id: 'engine-reads-mode', keywords: ['engine', 'mode'] },
  ],
};

const CLEAN: ExploreTruthDocument = {
  role: 'explore',
  files: [],
  relationships: [],
};

function scoreOf(scores: readonly DimensionScore[], dimension: string): number {
  return (
    scores.find((s: DimensionScore): boolean => s.dimension === dimension)
      ?.score ?? -1
  );
}

function score(artifact: ExploreArtifact, truth: ExploreTruthDocument) {
  return scoreExplore(artifact, truth, KEYWORD_MATCH_THRESHOLD);
}

describe('scoreExplore', () => {
  it('recalls the files the truth expects', () => {
    const scores: readonly DimensionScore[] = score(
      {
        paths: ['src/mode.js', 'src/engine.js'],
        relationships: ['src/engine.js src/mode.js reads the mode from'],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(1);
    expect(scoreOf(scores, 'relationship-coverage')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('scores partial recall for half the files', () => {
    const scores: readonly DimensionScore[] = score(
      { paths: ['src/mode.js'], relationships: [] },
      TRUTH,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(0.5);
    expect(scoreOf(scores, 'relationship-coverage')).toBe(0);
  });

  it('counts a path the truth does not expect as a false positive', () => {
    const scores: readonly DimensionScore[] = score(
      {
        paths: ['src/mode.js', 'src/engine.js', 'README.md'],
        relationships: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBeCloseTo(2 / 3, 10);
  });

  it('recalls a file named by a longer path', () => {
    const scores: readonly DimensionScore[] = score(
      {
        paths: ['./src/mode.js', 'src/engine.js'],
        relationships: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(1);
  });

  it('rewards an honest empty-handed map on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score(
      { paths: [], relationships: [] },
      CLEAN,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(1);
    expect(scoreOf(scores, 'relationship-coverage')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('penalises inventing findings on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score(
      { paths: ['src/mode.js'], relationships: [] },
      CLEAN,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(0);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('scores the same inputs identically every time', () => {
    const artifact: ExploreArtifact = {
      paths: ['src/mode.js'],
      relationships: ['engine reads the mode'],
    };

    expect(score(artifact, TRUTH)).toEqual(score(artifact, TRUTH));
  });
});
