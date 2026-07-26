import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { STUB_SOURCE } from './stub-source';

export async function writeDevinStubBin(binDir: string): Promise<string> {
  await mkdir(binDir, { recursive: true });
  const binPath: string = join(binDir, 'devin');
  await writeFile(binPath, STUB_SOURCE, 'utf8');
  await chmod(binPath, 0o755);
  return binPath;
}
