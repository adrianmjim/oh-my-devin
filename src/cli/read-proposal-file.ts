import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { UsageError } from '../run/usage-error';

export async function readProposalFile(
  cwd: string,
  path: string,
): Promise<string> {
  try {
    return await readFile(resolve(cwd, path), 'utf8');
  } catch {
    throw new UsageError(`proposal file "${path}" is not readable`);
  }
}
