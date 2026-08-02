import { fileMtime } from './file-mtime';
import { recordDirMtime } from './record-dir-mtime';
import type { RunRecordPaths } from './run-record-paths';

export async function recordActivityAt(
  paths: RunRecordPaths,
): Promise<number | null> {
  const dirMtime: number | null = await recordDirMtime(paths.dir);
  let activityAt: number | null = null;
  if (dirMtime !== null) {
    const journalMtime: number | null = await fileMtime(paths.journal);
    const livenessMtime: number | null = await fileMtime(paths.liveness);
    activityAt = Math.max(
      dirMtime,
      journalMtime ?? dirMtime,
      livenessMtime ?? dirMtime,
    );
  }
  return activityAt;
}
