import { admitCandidate } from './admit-candidate';
import { cursorForSession } from './cursor-for-session';
import { detectMoments } from './detect-moments';
import { detectTranscriptMoments } from './detect-transcript-moments';
import type { DetectedMoment } from './detected-moment';
import { readStagedCandidates } from './read-staged-candidates';
import { readTranscriptCursors } from './read-transcript-cursors';
import { readTranscriptSlice } from './read-transcript-slice';
import type { StagedCandidate } from './staged-candidate';
import { stageCandidate } from './stage-candidate';
import type { TranscriptCursor } from './transcript-cursor';
import type { TranscriptReadResult } from './transcript-read-result';
import { withDetectionStateLock } from './with-detection-state-lock';
import { writeStagedCandidates } from './write-staged-candidates';
import { advanceCursor } from './advance-cursor';
import { writeTranscriptCursors } from './write-transcript-cursors';

export function stageDetectedMoments(
  baseDir: string,
  sessionId: string | null,
  prompt: string,
  storePath: string,
  now: number,
): Promise<void> {
  return withDetectionStateLock(baseDir, async (): Promise<void> => {
    const moments: DetectedMoment[] = [...detectMoments(prompt)];
    if (sessionId !== null) {
      const cursors: readonly TranscriptCursor[] =
        await readTranscriptCursors(baseDir);
      const read: TranscriptReadResult = readTranscriptSlice(
        storePath,
        cursorForSession(cursors, sessionId),
      );
      moments.push(...detectTranscriptMoments(read.messages));
      if (read.reach === 'both-substrates') {
        await writeTranscriptCursors(
          baseDir,
          advanceCursor(cursors, read.cursor),
        );
      }
    }
    if (moments.length > 0) {
      let staged: readonly StagedCandidate[] =
        await readStagedCandidates(baseDir);
      for (const moment of moments) {
        staged = admitCandidate(
          staged,
          stageCandidate(moment, sessionId, now),
          now,
        );
      }
      await writeStagedCandidates(baseDir, staged);
    }
  });
}
