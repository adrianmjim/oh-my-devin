import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { REGION_NOTE } from '../ownership/region-marker';
import type { SetupResult } from './setup-result';
import type { TargetReport } from './target-report';
import { setupLayer } from './setup-layer';

const REGISTRY_PATH: string = join('.devin', 'hooks.v1.json');

describe('installed templates', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-note-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('names, in every template it installs, who maintains the region and what survives', async () => {
    const result: SetupResult = await setupLayer(dir, { version: '1.2.3' });
    const framed: readonly TargetReport[] = result.targets.filter(
      (report: TargetReport): boolean => report.path !== REGISTRY_PATH,
    );

    expect(framed.length).toBeGreaterThan(0);
    for (const report of framed) {
      const content: string = await readFile(join(dir, report.path), 'utf8');

      expect(content, report.path).toContain(REGION_NOTE);
      expect(content, report.path).toContain('omd setup');
      expect(content, report.path).toContain('preserved');
    }
  });

  it('leaves the claimed hook registry unmarked, since its format carries no comment', async () => {
    await setupLayer(dir, { version: '1.2.3' });

    const registry: string = await readFile(join(dir, REGISTRY_PATH), 'utf8');

    expect(registry).not.toContain(REGION_NOTE);
    expect(JSON.parse(registry)).toBeDefined();
  });
});
