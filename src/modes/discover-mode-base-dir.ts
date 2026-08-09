import type { Stats } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

export async function discoverModeBaseDir(cwd: string): Promise<string> {
  const start: string = resolve(cwd);
  let candidate: string = start;
  let found: string | null = null;
  let ended: boolean = false;
  while (found === null && !ended) {
    let marked: boolean;
    try {
      const stats: Stats = await stat(join(candidate, '.omd'));
      marked = stats.isDirectory();
    } catch {
      marked = false;
    }
    if (marked) {
      found = candidate;
    } else {
      const parent: string = dirname(candidate);
      ended = parent === candidate;
      candidate = parent;
    }
  }
  return found ?? start;
}
