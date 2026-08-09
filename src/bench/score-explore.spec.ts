import { describe, expect, it } from 'vitest';
import type { DimensionScore } from './dimension-score';
import type { ExploreArtifact } from './explore-artifact';
import type { ExploreTruthDocument } from './explore-truth-document';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreExplore } from './score-explore';

const TRUTH: ExploreTruthDocument = {
  role: 'explore',
  files: [
    { id: 'mode', path: 'src/mode.js', keywords: ['mode', 'flag'] },
    { id: 'engine', path: 'src/engine.js', keywords: ['engine', 'boot'] },
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
        findings: [
          {
            path: 'src/mode.js',
            relevance: 'Owns the mode flag the run starts from',
          },
          {
            path: 'src/engine.js',
            relevance: 'Boots the engine with the mode it read',
          },
        ],
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
      {
        findings: [
          { path: 'src/mode.js', relevance: 'Owns the mode flag' },
        ],
        relationships: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(0.5);
    expect(scoreOf(scores, 'relationship-coverage')).toBe(0);
  });

  it('gives no recall credit to a boilerplate relevance', () => {
    const scores: readonly DimensionScore[] = score(
      {
        findings: [
          { path: 'src/mode.js', relevance: 'related file' },
          {
            path: 'src/engine.js',
            relevance: 'Boots the engine with the mode it read',
          },
        ],
        relationships: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(0.5);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('counts a path the truth does not expect as a false positive', () => {
    const scores: readonly DimensionScore[] = score(
      {
        findings: [
          {
            path: 'src/mode.js',
            relevance: 'Owns the mode flag the run starts from',
          },
          {
            path: 'src/engine.js',
            relevance: 'Boots the engine with the mode it read',
          },
          { path: 'README.md', relevance: 'General notes on the project' },
        ],
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
        findings: [
          {
            path: './src/mode.js',
            relevance: 'Owns the mode flag the run starts from',
          },
          {
            path: 'src/engine.js',
            relevance: 'Boots the engine with the mode it read',
          },
        ],
        relationships: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(1);
  });

  it('counts a fabricated relationship as a false positive', () => {
    const scores: readonly DimensionScore[] = score(
      {
        findings: [
          {
            path: 'src/mode.js',
            relevance: 'Owns the mode flag the run starts from',
          },
          {
            path: 'src/engine.js',
            relevance: 'Boots the engine with the mode it read',
          },
        ],
        relationships: [
          'src/engine.js src/mode.js reads the mode from',
          'src/mode.js src/config.js loads defaults from',
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'relationship-coverage')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0.75);
  });

  it('penalises fabricated relationships on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score(
      {
        findings: [],
        relationships: ['src/mode.js src/engine.js boots the engine from'],
      },
      CLEAN,
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('rewards an honest empty-handed map on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score(
      { findings: [], relationships: [] },
      CLEAN,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(1);
    expect(scoreOf(scores, 'relationship-coverage')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('penalises inventing findings on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score(
      {
        findings: [{ path: 'src/mode.js', relevance: 'Decides the mode' }],
        relationships: [],
      },
      CLEAN,
    );

    expect(scoreOf(scores, 'file-recall')).toBe(0);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('scores the same inputs identically every time', () => {
    const artifact: ExploreArtifact = {
      findings: [
        { path: 'src/mode.js', relevance: 'Owns the mode flag' },
      ],
      relationships: ['engine reads the mode'],
    };

    expect(score(artifact, TRUTH)).toEqual(score(artifact, TRUTH));
  });
});
