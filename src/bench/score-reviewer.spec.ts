import { describe, expect, it } from 'vitest';
import type { BenchDimension } from './bench-dimension';
import type { DimensionScore } from './dimension-score';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import type { ReviewerArtifact } from './reviewer-artifact';
import type { ReviewerTruthDocument } from './reviewer-truth-document';
import { scoreReviewer } from './score-reviewer';

const TRUTH: ReviewerTruthDocument = {
  role: 'reviewer',
  expectedVerdict: 'request_changes',
  defects: [
    {
      id: 'unbounded-loop',
      keywords: ['unbounded', 'loop'],
      severity: 'high',
    },
    { id: 'missing-guard', keywords: ['null', 'guard'], severity: 'critical' },
  ],
};

const CLEAN_TRUTH: ReviewerTruthDocument = {
  role: 'reviewer',
  expectedVerdict: 'approve',
  defects: [],
};

function scoreOf(
  scores: readonly DimensionScore[],
  dimension: BenchDimension,
): number {
  return (
    scores.find((score: DimensionScore): boolean => score.dimension === dimension)
      ?.score ?? Number.NaN
  );
}

describe('scoreReviewer', () => {
  it('scores a detected defect as a true positive and an unmatched one as a miss', () => {
    const artifact: ReviewerArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'high',
          location: 'src/loop.js:4',
          summary: 'the loop is unbounded',
          fix: 'bound the iteration',
        },
      ],
    };

    const scores: readonly DimensionScore[] = scoreReviewer(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'detection')).toBe(0.5);
  });

  it('scores every defect detected as full detection', () => {
    const artifact: ReviewerArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'high',
          location: 'src/loop.js:4',
          summary: 'the loop is unbounded',
          fix: 'bound it',
        },
        {
          severity: 'critical',
          location: 'src/parse.js:9',
          summary: 'no null guard before the deref',
          fix: 'guard the null case',
        },
      ],
    };

    const scores: readonly DimensionScore[] = scoreReviewer(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
    expect(scoreOf(scores, 'severity-accuracy')).toBe(1);
    expect(scoreOf(scores, 'verdict-accuracy')).toBe(1);
  });

  it('scores a finding matching no defect as a false positive', () => {
    const artifact: ReviewerArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'high',
          location: 'src/loop.js:4',
          summary: 'the loop is unbounded',
          fix: 'bound it',
        },
        {
          severity: 'low',
          location: 'src/style.js:1',
          summary: 'the naming here reads oddly',
          fix: 'rename it',
        },
      ],
    };

    const scores: readonly DimensionScore[] = scoreReviewer(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0.5);
  });

  it('scores a clean fixture below a silent one when it invents findings', () => {
    const invented: ReviewerArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'high',
          location: 'src/ok.js:2',
          summary: 'this could be fragile',
          fix: 'harden it',
        },
      ],
    };
    const silent: ReviewerArtifact = { verdict: 'approve', findings: [] };

    const inventedScores: readonly DimensionScore[] = scoreReviewer(
      invented,
      CLEAN_TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );
    const silentScores: readonly DimensionScore[] = scoreReviewer(
      silent,
      CLEAN_TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(inventedScores, 'false-positive-resistance')).toBeLessThan(
      scoreOf(silentScores, 'false-positive-resistance'),
    );
    expect(scoreOf(silentScores, 'false-positive-resistance')).toBe(1);
  });

  it('scores a detected defect filed at the wrong severity', () => {
    const artifact: ReviewerArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'low',
          location: 'src/loop.js:4',
          summary: 'the loop is unbounded',
          fix: 'bound it',
        },
        {
          severity: 'critical',
          location: 'src/parse.js:9',
          summary: 'no null guard before the deref',
          fix: 'guard the null case',
        },
      ],
    };

    const scores: readonly DimensionScore[] = scoreReviewer(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'severity-accuracy')).toBe(0.5);
  });

  it('counts an undetected defect against severity accuracy too', () => {
    const artifact: ReviewerArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'high',
          location: 'src/loop.js:4',
          summary: 'the loop is unbounded',
          fix: 'bound it',
        },
      ],
    };

    const scores: readonly DimensionScore[] = scoreReviewer(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'severity-accuracy')).toBe(0.5);
  });

  it('scores a verdict that contradicts the ground truth as zero', () => {
    const artifact: ReviewerArtifact = { verdict: 'approve', findings: [] };

    const scores: readonly DimensionScore[] = scoreReviewer(
      artifact,
      TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(scoreOf(scores, 'verdict-accuracy')).toBe(0);
    expect(scoreOf(scores, 'detection')).toBe(0);
  });

  it('is deterministic: the same artifact scored twice yields the same scores', () => {
    const artifact: ReviewerArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'high',
          location: 'src/loop.js:4',
          summary: 'the loop is unbounded',
          fix: 'bound it',
        },
        {
          severity: 'low',
          location: 'src/style.js:1',
          summary: 'naming reads oddly',
          fix: 'rename',
        },
      ],
    };

    expect(scoreReviewer(artifact, TRUTH, KEYWORD_MATCH_THRESHOLD)).toEqual(
      scoreReviewer(artifact, TRUTH, KEYWORD_MATCH_THRESHOLD),
    );
  });

  it('reports its dimensions in the reviewer weight-set order', () => {
    const scores: readonly DimensionScore[] = scoreReviewer(
      { verdict: 'approve', findings: [] },
      CLEAN_TRUTH,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(
      scores.map((score: DimensionScore): BenchDimension => score.dimension),
    ).toEqual([
      'detection',
      'false-positive-resistance',
      'severity-accuracy',
      'verdict-accuracy',
    ]);
  });
});
