import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CLI_PATH } from './cli-path';

export async function writeOmdShimBin(binDir: string): Promise<string> {
  await mkdir(binDir, { recursive: true });
  const binPath: string = join(binDir, 'omd');
  await writeFile(
    binPath,
    ['#!/bin/sh', `exec "${process.execPath}" "${CLI_PATH}" "$@"`, ''].join(
      '\n',
    ),
    'utf8',
  );
  await chmod(binPath, 0o755);
  return binPath;
}
