import { readFile } from 'node:fs/promises';
import { DetectionStatePaths } from './detection-state-paths';
import { isTranscriptCursor } from './is-transcript-cursor';
import type { TranscriptCursor } from './transcript-cursor';

export async function readTranscriptCursors(
  baseDir: string,
): Promise<readonly TranscriptCursor[]> {
  let raw: string;
  try {
    raw = await readFile(new DetectionStatePaths(baseDir).cursors, 'utf8');
  } catch {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter(isTranscriptCursor) : [];
}
