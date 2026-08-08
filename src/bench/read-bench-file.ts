import { readFile } from 'node:fs/promises';
import { BenchFixtureError } from './bench-fixture-error';

export async function readBenchFile(path: string): Promise<string> {
  let content: string;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    throw new BenchFixtureError(`"${path}" is missing or unreadable`);
  }
  return content;
}
