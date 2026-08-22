import { describe, expect, it } from 'vitest';
import type { DetectedMoment } from './detected-moment';
import { detectMoments } from './detect-moments';
import { QUALITY_GATE_THRESHOLD } from './quality-gate-threshold';

describe('detectMoments', () => {
  it('detects an extractable moment in prompt text', () => {
    const moments: readonly DetectedMoment[] = detectMoments(
      'from now on run the linter before pushing to main',
    );

    expect(moments).toHaveLength(1);
    expect(moments[0]?.score).toBeGreaterThanOrEqual(QUALITY_GATE_THRESHOLD);
    expect(moments[0]?.principle).toContain('run the linter before pushing');
  });

  it('discards a moment below the quality gate', () => {
    expect(detectMoments('always lint')).toEqual([]);
  });

  it('discards text carrying no directive at all', () => {
    expect(detectMoments('why did the linter fail on that branch')).toEqual([]);
  });

  it('discards prose carrying a marker only inside a longer word', () => {
    expect(
      detectMoments('whenever the build runs the cache is warmed first'),
    ).toEqual([]);
  });

  it('states every candidate as a principle, never as a verbatim excerpt', () => {
    const source: string =
      'ok so, never merge to main without a green pipeline, please';

    const moments: readonly DetectedMoment[] = detectMoments(source);

    expect(moments).toHaveLength(1);
    expect(source).not.toContain(moments[0]?.principle ?? source);
  });

  it('never proposes a code snippet as a principle', () => {
    expect(
      detectMoments('always run `pnpm lint --fix` before pushing to main'),
    ).toEqual([]);
  });

  it('reads each sentence of a multi-sentence prompt', () => {
    const moments: readonly DetectedMoment[] = detectMoments(
      'the build broke again. always run the linter before pushing to main. thanks',
    );

    expect(moments).toHaveLength(1);
  });
});
