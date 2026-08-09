import { describe, expect, it } from 'vitest';
import type { DebuggerArtifact } from './debugger-artifact';
import type { DebuggerTruthDocument } from './debugger-truth-document';
import type { DimensionScore } from './dimension-score';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { scoreDebugger } from './score-debugger';

const TRUTH: DebuggerTruthDocument = {
  role: 'debugger',
  causes: [
    {
      id: 'early-read',
      keywords: ['resume', 'assigns'],
      location: 'src/session.js:12',
    },
  ],
  evidence: [],
  eliminations: [],
};

const CLEAN: DebuggerTruthDocument = {
  role: 'debugger',
  causes: [],
  evidence: [],
  eliminations: [],
};

const EXPECTING: DebuggerTruthDocument = {
  role: 'debugger',
  causes: [],
  evidence: [{ id: 'repeated-runs', keywords: ['test.js', 'pass'] }],
  eliminations: [{ id: 'no-reproduction', keywords: ['reproduce'] }],
};

function scoreOf(scores: readonly DimensionScore[], dimension: string): number {
  return (
    scores.find((s: DimensionScore): boolean => s.dimension === dimension)
      ?.score ?? -1
  );
}

function score(artifact: DebuggerArtifact, truth: DebuggerTruthDocument) {
  return scoreDebugger(artifact, truth, KEYWORD_MATCH_THRESHOLD);
}

describe('scoreDebugger', () => {
  it('scores full localization for the right cause at the right place', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['node test.js throws on resume'],
        rootCause: {
          location: 'src/session.js:12',
          text: 'the id is read before the resume branch assigns it',
        },
        eliminated: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'root-cause-localization')).toBe(1);
    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('halves localization for the right cause at the wrong place', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['node test.js throws on resume'],
        rootCause: {
          location: 'src/other.js:99',
          text: 'the id is read before the resume branch assigns it',
        },
        eliminated: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'root-cause-localization')).toBe(0.5);
  });

  it('scores zero localization for a cause that pairs with nothing', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['node test.js fails'],
        rootCause: {
          location: 'src/other.js:99',
          text: 'the logger swallows the stack trace',
        },
        eliminated: [],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'root-cause-localization')).toBe(0);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('credits detection when the cause surfaces only in the evidence', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['on resume the branch never assigns the id'],
        rootCause: null,
        eliminated: ['stale build'],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'root-cause-localization')).toBe(0);
  });

  it('does not punish an honest failure to isolate as a false positive', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['node test.js fails intermittently'],
        rootCause: null,
        eliminated: ['stale build', 'test pollution'],
      },
      TRUTH,
    );

    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('rewards an honest not-isolated result on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['the suite passes on every run'],
        rootCause: null,
        eliminated: ['a race: the failure never reproduces'],
      },
      CLEAN,
    );

    expect(scoreOf(scores, 'root-cause-localization')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('scores an honest not-isolated report against the expected surfaces', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['node test.js repeated ten times: every run passes'],
        rootCause: null,
        eliminated: ['an intermittent failure: it does not reproduce here'],
      },
      EXPECTING,
    );

    expect(scoreOf(scores, 'detection')).toBe(1);
    expect(scoreOf(scores, 'root-cause-localization')).toBe(1);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('scores fabricated not-isolated content at zero detection', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['inspected the code and saw nothing suspicious'],
        rootCause: null,
        eliminated: ['perhaps the network was slow'],
      },
      EXPECTING,
    );

    expect(scoreOf(scores, 'detection')).toBe(0);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(1);
  });

  it('pairs expected eliminations only with eliminated hypotheses', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['node test.js passes and the failure does not reproduce'],
        rootCause: null,
        eliminated: [],
      },
      EXPECTING,
    );

    expect(scoreOf(scores, 'detection')).toBe(0.5);
  });

  it('penalises inventing a cause on a clean fixture', () => {
    const scores: readonly DimensionScore[] = score(
      {
        evidence: ['the suite passes'],
        rootCause: { location: 'src/session.js:12', text: 'looks fragile' },
        eliminated: [],
      },
      CLEAN,
    );

    expect(scoreOf(scores, 'root-cause-localization')).toBe(0);
    expect(scoreOf(scores, 'false-positive-resistance')).toBe(0);
  });

  it('scores the same inputs identically every time', () => {
    const artifact: DebuggerArtifact = {
      evidence: ['node test.js throws on resume'],
      rootCause: {
        location: 'src/session.js:12',
        text: 'the resume branch never assigns the id',
      },
      eliminated: [],
    };

    expect(score(artifact, TRUTH)).toEqual(score(artifact, TRUTH));
  });
});
