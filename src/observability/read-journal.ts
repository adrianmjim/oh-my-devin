import { readFile } from 'node:fs/promises';
import { isProgressEvent } from './is-progress-event';
import type { ProgressEvent } from './progress-event';

export async function readJournal(
  journalPath: string,
): Promise<readonly ProgressEvent[] | null> {
  let raw: string;
  try {
    raw = await readFile(journalPath, 'utf8');
  } catch {
    return null;
  }
  const events: ProgressEvent[] = [];
  for (const line of raw.split('\n')) {
    if (line.trim() !== '') {
      const parsed: unknown = JSON.parse(line);
      if (isProgressEvent(parsed)) {
        events.push(parsed);
      }
    }
  }
  return events;
}
