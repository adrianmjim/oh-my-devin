import { randomUUID } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function writeFileAtomically(
  path: string,
  content: string,
): Promise<void> {
  const temp: string = `${path}.${randomUUID()}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(temp, content);
  await rename(temp, path);
}
