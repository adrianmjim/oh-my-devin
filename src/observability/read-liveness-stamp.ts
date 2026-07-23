import { readFile } from 'node:fs/promises';
import type { LivenessStamp } from './liveness-stamp';

export async function readLivenessStamp(
  stampPath: string,
): Promise<LivenessStamp | null> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(stampPath, 'utf8'));
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }
  const stampedAt: unknown = (parsed as Record<string, unknown>)['stampedAt'];
  return typeof stampedAt === 'number' ? { stampedAt } : null;
}
