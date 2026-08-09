import { describe, expect, it } from 'vitest';
import type { CriticArtifact } from './critic-artifact';
import type { CriticTruthDocument } from './critic-truth-document';
import type { DimensionScore } from './dimension-score';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreCritic } from './score-critic';

const TRUTH: CriticTruthDocument = {
  role: 'critic',
  expectedVerdict: 'request_changes',
  findings: [
    {
      id: 'no-rollback',
      keywords: ['rollback', 'cutover'],
      severity: 'high',
      category: 'missing_element',
    },
    {
      id: 'backfill-order',
      keywords: ['backfill', 'order'],
      severity: 'medium',
      category: 'present_flaw',
    },
  ],
};

const CLEAN_TRUTH: CriticTruthDocument = {
  role: 'critic',
  expectedVerdict: 'approve',
  findings: [],
};

function scoreOf(
  scores: readonly DimensionScore[],
  dimension: string,
): number {
  return (
    scores.find((s: DimensionScore): boolean => s.dimension === dimension)
      ?.score ?? -1
  );
}

function score(artifact: CriticArtifact, truth: CriticTruthDocument) {
  return scoreCritic(artifact, truth, KEYWORD_MATCH_THRESHOLD);
}

describe('scoreCritic', () => {
  it('credits a present flaw against detection alone', () => {
    const scores: readonly DimensionScore[] = score(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'medium',
            category: 'present_flaw',
            where: 'plan.md:4',
            summary: 'The backfill runs in the wrong order',
            fix: 'Move the backfill ahead of the cutover',
          },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'missing-element-coverage')).toBe(0);
  });

  it('credits a missing element against its own dimension alone', () => {
    const scores: readonly DimensionScore[] = score(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            category: 'missing_element',
            where: 'rollback step',
            summary: 'Nothing undoes the cutover',
            fix: 'Add a rollback step',
          },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'missing-element-coverage')).toBe(1);
    expect(scoreOf(scores, 'detection')).toBe(0);
  });

  it('scores both halves when the critique finds both', () => {
    const scores: readonly DimensionScore[] = score(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            category: 'missing_element',
            where: 'rollback step',
            summary: 'Nothing undoes the cutover',
            fix: 'Add a rollback step',
          },
          {
            severity: 'medium',
            category: 'present_flaw',
            where: 'plan.md:4',
            summary: 'The backfill runs out of order',
            fix: 'Move the backfill earlier',
          },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'missing-element-coverage')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
    expect(scoreOf(scores, 'verdict-accuracy')).toBe(1);
  });

  it('counts a finding matching nothing as a false positive', () => {
    const scores: readonly DimensionScore[] = score(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'low',
            category: 'present_flaw',
            where: 'plan.md:9',
            summary: 'The heading capitalisation is inconsistent',
            fix: 'Capitalise the headings',
          },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('gives a clean fixture full false-positive resistance when quiet', () => {
    const scores: readonly DimensionScore[] = score(
      { verdict: 'approve', findings: [] },
      CLEAN_TRUTH,
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'missing-element-coverage')).toBe(1);
    expect(scoreOf(scores, 'verdict-accuracy')).toBe(1);
  });

  it('penalises invented findings on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            category: 'present_flaw',
            where: 'plan.md:1',
            summary: 'Something feels off about the approach',
            fix: 'Rethink it',
          },
        ],
      },
      CLEAN_TRUTH,
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
    expect(scoreOf(scores, 'verdict-accuracy')).toBe(0);
  });

  it('scores the verdict against the truth', () => {
    const scores: readonly DimensionScore[] = score(
      { verdict: 'approve', findings: [] },
      TRUTH,
    );

    expect(scoreOf(scores, 'verdict-accuracy')).toBe(0);
  });

  it('never lets one finding cover both halves of the truth', () => {
    const scores: readonly DimensionScore[] = score(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            category: 'present_flaw',
            where: 'plan.md:4',
            summary: 'The rollback and backfill order are both wrong',
            fix: 'Fix the cutover order and add a rollback',
          },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'missing-element-coverage')).toBe(0);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('gives a mislabeled finding no credit in the other category', () => {
    const scores: readonly DimensionScore[] = score(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            category: 'present_flaw',
            where: 'plan.md:6',
            summary: 'Nothing undoes the cutover',
            fix: 'Add a rollback step',
          },
        ],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(0);
    expect(scoreOf(scores, 'missing-element-coverage')).toBe(0);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('scores the same inputs identically every time', () => {
    const artifact: CriticArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'high',
          category: 'missing_element',
          where: 'rollback step',
          summary: 'Nothing undoes the cutover',
          fix: 'Add a rollback step',
        },
      ],
    };

    expect(score(artifact, TRUTH)).toEqual(score(artifact, TRUTH));
  });

  it('reports every dimension the critic weights name', () => {
    const scores: readonly DimensionScore[] = score(
      { verdict: 'approve', findings: [] },
      CLEAN_TRUTH,
    );

    expect(scores.map((s: DimensionScore): string => s.dimension)).toEqual([
      'detection',
      'missing-element-coverage',
      'false-positive-resistance',
      'verdict-accuracy',
    ]);
  });
});
