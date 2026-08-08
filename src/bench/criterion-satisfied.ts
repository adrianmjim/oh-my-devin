import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ExecutorTruthCriterion } from './executor-truth-criterion';

export async function criterionSatisfied(
  treeDir: string,
  criterion: ExecutorTruthCriterion,
): Promise<boolean> {
  let content: string | null;
  try {
    content = await readFile(join(treeDir, criterion.path), 'utf8');
  } catch {
    content = null;
  }
  const found: string | null = content;
  return (
    found !== null &&
    criterion.contains.every((fragment: string): boolean =>
      found.includes(fragment),
    )
  );
}
