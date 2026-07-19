import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ArtifactValidation } from './artifact-validation';
import { ArtifactValidationError } from './artifact-validation-error';
import { validateArtifact } from './validate-artifact';

const SCHEMA = {
  type: 'object',
  required: ['verdict'],
  properties: { verdict: { type: 'string' } },
  additionalProperties: false,
};

describe('validateArtifact', () => {
  let dir: string;
  let schemaPath: string;
  let artifactPath: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-validate-'));
    schemaPath = join(dir, 'schema.json');
    artifactPath = join(dir, 'artifact.json');
    await writeFile(schemaPath, JSON.stringify(SCHEMA), 'utf8');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reports a conforming artifact as valid', async () => {
    await writeFile(artifactPath, JSON.stringify({ verdict: 'pass' }), 'utf8');

    const result: ArtifactValidation = await validateArtifact(
      artifactPath,
      schemaPath,
    );

    expect(result).toEqual({ valid: true, missing: false, errors: [] });
  });

  it('reports a missing artifact as missing and invalid', async () => {
    const result: ArtifactValidation = await validateArtifact(
      artifactPath,
      schemaPath,
    );

    expect(result.valid).toBe(false);
    expect(result.missing).toBe(true);
    expect(result.errors.join(' ')).toMatch(/missing/i);
  });

  it('reports schema violations for a non-conforming artifact', async () => {
    await writeFile(artifactPath, JSON.stringify({ verdict: 7 }), 'utf8');

    const result: ArtifactValidation = await validateArtifact(
      artifactPath,
      schemaPath,
    );

    expect(result.valid).toBe(false);
    expect(result.missing).toBe(false);
    expect(result.errors.join(' ')).toMatch(/verdict/);
  });

  it('reports an artifact that is not valid JSON as invalid but present', async () => {
    await writeFile(artifactPath, 'not json', 'utf8');

    const result: ArtifactValidation = await validateArtifact(
      artifactPath,
      schemaPath,
    );

    expect(result.valid).toBe(false);
    expect(result.missing).toBe(false);
    expect(result.errors.join(' ')).toMatch(/json/i);
  });

  it('throws when the declared schema file is absent', async () => {
    await writeFile(artifactPath, JSON.stringify({ verdict: 'pass' }), 'utf8');

    await expect(
      validateArtifact(artifactPath, join(dir, 'no-schema.json')),
    ).rejects.toThrow(ArtifactValidationError);
  });
});
