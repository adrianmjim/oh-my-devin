import { describe, expect, it } from 'vitest';
import { CANDIDATE_EXPIRY_WINDOW_MS } from './candidate-expiry-window-ms';
import type { DetectedMoment } from './detected-moment';
import { stageCandidate } from './stage-candidate';
import type { StagedCandidate } from './staged-candidate';

const MOMENT: DetectedMoment = {
  principle: 'In this project, always run the linter before pushing.',
  score: 0.8,
};

describe('stageCandidate', () => {
  it('carries the principle and the command that confirms it', () => {
    const candidate: StagedCandidate = stageCandidate(MOMENT, 1_000);

    expect(candidate.principle).toBe(MOMENT.principle);
    expect(candidate.confirmingCommand).toContain('omd memory remember');
    expect(candidate.confirmingCommand).toContain(MOMENT.principle);
    expect(candidate.score).toBe(0.8);
  });

  it('expires after the omd-owned window', () => {
    expect(stageCandidate(MOMENT, 1_000).expiresAt).toBe(
      1_000 + CANDIDATE_EXPIRY_WINDOW_MS,
    );
  });

  it('stages undelivered', () => {
    expect(stageCandidate(MOMENT, 1_000).deliveredAt).toBeNull();
  });
});
