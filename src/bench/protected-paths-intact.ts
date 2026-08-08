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
        const original: string = await readFile(
          join(originalDir, path),
          'utf8',
        );
        const current: string = await readFile(join(treeDir, path), 'utf8');
        intact = original === current;
      } catch {
        intact = false;
      }
      return intact;
    }),
  );
  return checks.every((value: boolean): boolean => value);
}
