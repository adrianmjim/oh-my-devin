import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ArtifactValidationError } from './artifact-validation-error';
import { readSchema } from './read-schema';

describe('readSchema', () => {
  let directory: string;

  async function write(name: string, content: string): Promise<string> {
    const path: string = join(directory, name);
    await writeFile(path, content, 'utf8');
    return path;
  }

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-read-schema-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('parses a JSON schema object', async () => {
    expect(
      await readSchema(await write('s.json', '{"type":"object"}')),
    ).toEqual({ type: 'object' });
  });

  it('refuses an absent schema', async () => {
    await expect(readSchema(join(directory, 'absent.json'))).rejects.toThrow(
      ArtifactValidationError,
    );
  });

  it('refuses a schema that is not valid JSON', async () => {
    await expect(readSchema(await write('s.json', 'nope'))).rejects.toThrow(
      /not valid JSON/,
    );
  });

  it('refuses a schema that is not a JSON object', async () => {
    await expect(readSchema(await write('s.json', '[]'))).rejects.toThrow(
      /must be a JSON object/,
    );
  });
});
