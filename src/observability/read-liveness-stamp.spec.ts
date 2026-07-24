import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LivenessStamp } from './liveness-stamp';
import { readLivenessStamp } from './read-liveness-stamp';

describe('readLivenessStamp', () => {
  let dir: string = '';
  let stampPath: string = '';

  beforeEach(async (): Promise<void> => {
    dir = await mkdtemp(join(tmpdir(), 'omd-read-stamp-'));
    stampPath = join(dir, 'liveness.json');
  });

  afterEach(async (): Promise<void> => {
    await rm(dir, { recursive: true, force: true });
  });

  it('returns null when the stamp file does not exist', async () => {
    expect(await readLivenessStamp(stampPath)).toBeNull();
  });

  it('returns null for malformed JSON', async () => {
    await writeFile(stampPath, 'not json', 'utf8');
    expect(await readLivenessStamp(stampPath)).toBeNull();
  });

  it('returns null when the payload is not an object', async () => {
    await writeFile(stampPath, JSON.stringify(42), 'utf8');
    expect(await readLivenessStamp(stampPath)).toBeNull();
  });

  it('returns null when stampedAt is absent or non-numeric', async () => {
    await writeFile(stampPath, JSON.stringify({ stampedAt: 'soon' }), 'utf8');
    expect(await readLivenessStamp(stampPath)).toBeNull();
  });

  it('returns the stamp when stampedAt is a number', async () => {
    await writeFile(stampPath, JSON.stringify({ stampedAt: 4242 }), 'utf8');
    const stamp: LivenessStamp | null = await readLivenessStamp(stampPath);
    expect(stamp).toEqual({ stampedAt: 4242 });
  });
});
