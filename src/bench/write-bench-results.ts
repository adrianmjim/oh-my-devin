import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { BenchRunMode } from './bench-run-mode';
import type { RoleBenchScore } from './role-bench-score';

export async function writeBenchResults(
  score: RoleBenchScore,
  resultsDir: string,
  mode: BenchRunMode,
): Promise<string> {
  await mkdir(resultsDir, { recursive: true });
  const suffix: string = mode === 'dry' ? '.dry.json' : '.json';
  const path: string = join(resultsDir, `${score.role}${suffix}`);
  await writeFile(path, `${JSON.stringify(score, null, 2)}\n`, 'utf8');
  return path;
}
