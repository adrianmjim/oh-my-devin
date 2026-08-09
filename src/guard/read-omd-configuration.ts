import { readFile } from 'node:fs/promises';
import type { OmdConfiguration } from './omd-configuration';
import { parseOmdConfiguration } from './parse-omd-configuration';

export async function readOmdConfiguration(
  path: string,
): Promise<OmdConfiguration | null> {
  let raw: string | null;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    raw = null;
  }
  return raw === null ? null : parseOmdConfiguration(raw);
}
