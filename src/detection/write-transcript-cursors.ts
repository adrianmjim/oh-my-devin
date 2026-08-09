import { writeFileAtomically } from '../memory/write-file-atomically';
import { DetectionStatePaths } from './detection-state-paths';
import type { TranscriptCursor } from './transcript-cursor';

export async function writeTranscriptCursors(
  baseDir: string,
  cursors: readonly TranscriptCursor[],
): Promise<void> {
  await writeFileAtomically(
    new DetectionStatePaths(baseDir).cursors,
    `${JSON.stringify(cursors, null, 2)}\n`,
  );
}
