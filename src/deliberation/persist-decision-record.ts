import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DecisionRecord } from './decision-record';

export async function persistDecisionRecord(
  baseDir: string,
  id: string,
  record: DecisionRecord,
): Promise<string> {
  const dir: string = join(baseDir, '.omd', 'deliberations', id);
  await mkdir(dir, { recursive: true });
  const path: string = join(dir, 'decision.json');
  await writeFile(path, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return path;
}
