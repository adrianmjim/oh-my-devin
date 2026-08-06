import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RoleBenchScore } from './role-bench-score';

export async function writeBenchResults(
  score: RoleBenchScore,
  resultsDir: string,
): Promise<string> {
  await mkdir(resultsDir, { recursive: true });
  const path: string = join(resultsDir, `${score.role}.json`);
  await writeFile(path, `${JSON.stringify(score, null, 2)}\n`, 'utf8');
  return path;
}
