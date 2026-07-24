import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { LivenessStamp } from './liveness-stamp';

export async function writeLivenessStamp(
  stampPath: string,
  stampedAt: number,
): Promise<void> {
  await mkdir(dirname(stampPath), { recursive: true });
  const stamp: LivenessStamp = { stampedAt };
  await writeFile(stampPath, `${JSON.stringify(stamp, null, 2)}\n`, 'utf8');
}
