import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LivenessStamp } from './liveness-stamp';
import { readLivenessStamp } from './read-liveness-stamp';
import { writeLivenessStamp } from './write-liveness-stamp';

describe('writeLivenessStamp / readLivenessStamp', () => {
  let base: string = '';
  let stampPath: string = '';

  beforeEach(async (): Promise<void> => {
    base = await mkdtemp(join(tmpdir(), 'omd-liveness-'));
    stampPath = join(base, '.omd', 'runs', 'run-1', 'liveness.json');
  });

  afterEach(async (): Promise<void> => {
    await rm(base, { recursive: true, force: true });
  });

  it('writes a stamp carrying the given timestamp, creating parent dirs', async () => {
    await writeLivenessStamp(stampPath, 4242);

    const stamp: LivenessStamp | null = await readLivenessStamp(stampPath);
    expect(stamp).toEqual({ stampedAt: 4242 });
  });

  it('updates the stamp in place on a later write', async () => {
    await writeLivenessStamp(stampPath, 1000);
    await writeLivenessStamp(stampPath, 2000);

    const stamp: LivenessStamp | null = await readLivenessStamp(stampPath);
    expect(stamp?.stampedAt).toBe(2000);
  });

  it('reads back null when no stamp has been written', async () => {
    const stamp: LivenessStamp | null = await readLivenessStamp(stampPath);
    expect(stamp).toBeNull();
  });

  it('reads back null for a stamp payload of the wrong shape', async () => {
    await mkdir(dirname(stampPath), { recursive: true });
    await writeFile(stampPath, JSON.stringify({ notStampedAt: 'x' }), 'utf8');

    expect(await readLivenessStamp(stampPath)).toBeNull();
  });
});
