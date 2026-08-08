import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function protectedPathsIntact(
  originalDir: string,
  treeDir: string,
  paths: readonly string[],
): Promise<boolean> {
  const checks: readonly boolean[] = await Promise.all(
    paths.map(async (path: string): Promise<boolean> => {
      let intact: boolean;
      try {
        const original: Buffer = await readFile(join(originalDir, path));
        const current: Buffer = await readFile(join(treeDir, path));
        intact = original.equals(current);
      } catch {
        intact = false;
      }
      return intact;
    }),
  );
  return checks.every((value: boolean): boolean => value);
}
