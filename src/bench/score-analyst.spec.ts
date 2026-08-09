import { describe, expect, it } from 'vitest';
import type { AnalystArtifact } from './analyst-artifact';
import type { AnalystTruthDocument } from './analyst-truth-document';
import type { DimensionScore } from './dimension-score';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreAnalyst } from './score-analyst';

const TRUTH: AnalystTruthDocument = {
  role: 'analyst',
  gaps: [
    { id: 'size-zero', keywords: ['size', 'zero'], surface: 'criterion' },
    { id: 'retention', keywords: ['retention', 'owner'], surface: 'question' },
  ],
};

const EMPTY: AnalystArtifact = {
  criteria: [],
  questions: [],
  assumptions: [],
  risks: [],
};

const RISK_TRUTH: AnalystTruthDocument = {
  role: 'analyst',
  gaps: [
    {
      id: 'reporting-creep',
      keywords: ['filter', 'reporting'],
      surface: 'risk',
    },
  ],
};

function scoreOf(scores: readonly DimensionScore[], dimension: string): number {
  return (
    scores.find((s: DimensionScore): boolean => s.dimension === dimension)
      ?.score ?? -1
  );
}

function score(artifact: AnalystArtifact, truth: AnalystTruthDocument) {
  return scoreAnalyst(artifact, truth, KEYWORD_MATCH_THRESHOLD);
}

describe('scoreAnalyst', () => {
  it('credits a gap surfaced in the list the truth names', () => {
    const scores: readonly DimensionScore[] = score(
      {
        ...EMPTY,
        criteria: ['a size of zero is refused with a RangeError'],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(0.5);
    expect(scoreOf(scores, 'gap-coverage')).toBe(0.5);
  });

  it('credits detection but not coverage for the wrong list', () => {
    const scores: readonly DimensionScore[] = score(
      {
        ...EMPTY,
        criteria: ['the retention owner is named'],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(0.5);
    expect(scoreOf(scores, 'gap-coverage')).toBe(0);
  });

  it('scores full when both gaps land in their own lists', () => {
    const scores: readonly DimensionScore[] = score(
      {
        criteria: ['a size of zero is refused'],
        questions: ['which owner sets retention for these rows'],
        assumptions: [],
        risks: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'gap-coverage')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('covers gaps whose keywords collide across surfaces', () => {
    const scores: readonly DimensionScore[] = score(
      {
        criteria: ['the rate limit is enforced'],
        questions: ['what is the rate limit'],
        assumptions: [],
        risks: [],
      },
      {
        role: 'analyst',
        gaps: [
          {
            id: 'limit-question',
            keywords: ['rate', 'limit'],
            surface: 'question',
          },
          {
            id: 'limit-criterion',
            keywords: ['rate', 'limit'],
            surface: 'criterion',
          },
        ],
      },
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'gap-coverage')).toBe(1);
  });

  it('counts an invented question as a false positive', () => {
    const scores: readonly DimensionScore[] = score(
      {
        criteria: ['a size of zero is refused'],
        questions: ['should the logo be blue'],
        assumptions: [],
        risks: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('credits a scope risk surfaced in the risks list', () => {
    const scores: readonly DimensionScore[] = score(
      {
        ...EMPTY,
        risks: [
          'The export grows into reporting once callers ask for filters Record filter requests as separate scope',
        ],
      },
      RISK_TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'gap-coverage')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('credits detection but not coverage for a risk in the wrong list', () => {
    const scores: readonly DimensionScore[] = score(
      {
        ...EMPTY,
        questions: [
          'will the export grow into reporting once callers ask for filters',
        ],
      },
      RISK_TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'gap-coverage')).toBe(0);
  });

  it('counts an invented risk as a false positive', () => {
    const scores: readonly DimensionScore[] = score(
      {
        ...EMPTY,
        criteria: ['the command exits zero'],
        risks: ['the deadline may slip'],
      },
      { role: 'analyst', gaps: [] },
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('never counts an acceptance criterion as padding', () => {
    const scores: readonly DimensionScore[] = score(
      {
        criteria: ['the command exits zero', 'the report names the model'],
        questions: [],
        assumptions: [],
        risks: [],
      },
      { role: 'analyst', gaps: [] },
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('gives a clean fixture full marks when it invents nothing', () => {
    const scores: readonly DimensionScore[] = score(
      {
        criteria: ['the command exits zero'],
        questions: [],
        assumptions: [],
        risks: [],
      },
      { role: 'analyst', gaps: [] },
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'gap-coverage')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('scores an analysis that surfaced nothing at zero', () => {
    const scores: readonly DimensionScore[] = score(EMPTY, TRUTH);

    expect(scoreOf(scores, 'detection')).toBe(0);
    expect(scoreOf(scores, 'gap-coverage')).toBe(0);
  });

  it('scores the same inputs identically every time', () => {
    const artifact: AnalystArtifact = {
      criteria: ['a size of zero is refused'],
      questions: ['which owner sets retention'],
      assumptions: [],
      risks: [],
    };

    expect(score(artifact, TRUTH)).toEqual(score(artifact, TRUTH));
  });
});
