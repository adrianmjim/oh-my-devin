import type { RecordedObjection } from './recorded-objection';

export function dedupeObjections(
  objections: readonly RecordedObjection[],
): readonly RecordedObjection[] {
  const seen: Set<string> = new Set<string>();
  const unique: RecordedObjection[] = [];
  for (const objection of objections) {
    const key: string = JSON.stringify([
      objection.seat,
      objection.domain,
      objection.severity,
      objection.concern,
    ]);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(objection);
    }
  }
  return unique;
}
