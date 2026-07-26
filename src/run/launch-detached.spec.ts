import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import { launchDetached } from './launch-detached';
import { UsageError } from './usage-error';

describe('launchDetached', () => {
  let projectDir: string;
  let lookup: LayerLookup;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-launch-detached-'));
    lookup = { projectDir, userConfigDir: null };
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('refuses an empty task before spawning anything', async () => {
    await expect(
      launchDetached(lookup, 'cli.js', 'reviewer', '  '),
    ).rejects.toThrow(UsageError);
  });

  it('refuses an unknown role before spawning anything', async () => {
    await expect(
      launchDetached(lookup, 'cli.js', 'ghost', 'assess the diff'),
    ).rejects.toThrow(UsageError);
  });
});
