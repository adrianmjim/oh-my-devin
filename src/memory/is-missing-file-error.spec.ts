import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isMissingFileError } from './is-missing-file-error';

describe('isMissingFileError', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-missing-file-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('recognizes the error a missing file raises', async () => {
    let caught: unknown = null;
    try {
      await readFile(join(dir, 'absent.json'), 'utf8');
    } catch (error: unknown) {
      caught = error;
    }

    expect(isMissingFileError(caught)).toBe(true);
  });

  it('rejects an error carrying another code', () => {
    expect(
      isMissingFileError(
        Object.assign(new Error('denied'), { code: 'EACCES' }),
      ),
    ).toBe(false);
  });

  it('rejects an error carrying no code at all', () => {
    expect(isMissingFileError(new Error('plain'))).toBe(false);
  });

  it('rejects a value that is no error', () => {
    expect(isMissingFileError('ENOENT')).toBe(false);
  });
});
