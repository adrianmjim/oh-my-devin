import { describe, expect, it } from 'vitest';
import type { DimensionScore } from './dimension-score';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import type { ReviewerArtifact } from './reviewer-artifact';
import { scoreSecurityReviewer } from './score-security-reviewer';
import type { SecurityReviewerTruthDocument } from './security-reviewer-truth-document';

const TRUTH: SecurityReviewerTruthDocument = {
  role: 'security-reviewer',
  expectedVerdict: 'request_changes',
  vulnerabilities: [
    {
      id: 'shell-injection',
      keywords: ['shell', 'interpolat'],
      severity: 'critical',
    },
  ],
};

function scoreOf(scores: readonly DimensionScore[], dimension: string): number {
  return (
    scores.find((s: DimensionScore): boolean => s.dimension === dimension)
      ?.score ?? -1
  );
}

function score(artifact: ReviewerArtifact) {
  return scoreSecurityReviewer(artifact, TRUTH, KEYWORD_MATCH_THRESHOLD);
}

describe('scoreSecurityReviewer', () => {
  it('credits a paired vulnerability filed at the right severity', () => {
    const scores: readonly DimensionScore[] = score({
      verdict: 'request_changes',
      findings: [
        {
          severity: 'critical',
          location: 'src/run/build-command.ts:41',
          summary: 'Injection',
          fix: 'The role name is interpolated into a shell string',
        },
      ],
    });

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'severity-accuracy')).toBe(1);
    expect(scoreOf(scores, 'verdict-accuracy')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('withholds severity accuracy when the rating is wrong', () => {
    const scores: readonly DimensionScore[] = score({
      verdict: 'request_changes',
      findings: [
        {
          severity: 'low',
          location: 'src/run/build-command.ts:41',
          summary: 'Injection',
          fix: 'The role name is interpolated into a shell string',
        },
      ],
    });

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'severity-accuracy')).toBe(0);
  });

  it('counts an unreachable report as a false positive', () => {
    const scores: readonly DimensionScore[] = score({
      verdict: 'request_changes',
      findings: [
        {
          severity: 'medium',
          location: 'README.md:1',
          summary: 'Weak wording',
          fix: 'Reword the docs',
        },
      ],
    });

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('scores the same inputs identically every time', () => {
    const artifact: ReviewerArtifact = {
      verdict: 'request_changes',
      findings: [
        {
          severity: 'critical',
          location: 'a.ts:1',
          summary: 'Injection',
          fix: 'shell interpolation removed',
        },
      ],
    };

    expect(score(artifact)).toEqual(score(artifact));
  });
});
