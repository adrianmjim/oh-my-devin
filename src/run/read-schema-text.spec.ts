import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readSchemaText } from './read-schema-text';
import { UsageError } from './usage-error';

describe('readSchemaText', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-read-schema-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('yields the schema text', async () => {
    const path: string = join(directory, 'out.schema.json');
    await writeFile(path, '{"type":"object"}', 'utf8');

    expect(await readSchemaText(path, 'worker')).toBe('{"type":"object"}');
  });

  it('reports an absent schema as a usage error naming the role and path', async () => {
    const path: string = join(directory, 'absent.json');

    await expect(readSchemaText(path, 'worker')).rejects.toThrow(UsageError);
    await expect(readSchemaText(path, 'worker')).rejects.toThrow(/worker/);
    await expect(readSchemaText(path, 'worker')).rejects.toThrow(/absent.json/);
  });
});
