import { CANDIDATE_EXPIRY_WINDOW_MS } from './candidate-expiry-window-ms';
import type { DetectedMoment } from './detected-moment';
import { rememberInvocation } from './remember-invocation';
import type { StagedCandidate } from './staged-candidate';

export function stageCandidate(
  moment: DetectedMoment,
  sessionId: string | null,
  now: number,
): StagedCandidate {
  return {
    principle: moment.principle,
    confirmingCommand: rememberInvocation(moment.principle),
    score: moment.score,
    sessionId,
    expiresAt: now + CANDIDATE_EXPIRY_WINDOW_MS,
    deliveredAt: null,
  };
}
