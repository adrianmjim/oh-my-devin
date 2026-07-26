import type { Stats } from 'node:fs';
import { stat } from 'node:fs/promises';

export async function recordDirMtime(dir: string): Promise<number | null> {
  try {
    const stats: Stats = await stat(dir);
    return stats.isDirectory() ? stats.mtimeMs : null;
  } catch {
    return null;
  }
}
