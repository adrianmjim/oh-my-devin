import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
import { setupLayer } from '../setup/setup-layer';
import { buildPluginBundle } from './build-plugin-bundle';

const SHARED_SKILL_NAMES: readonly string[] = [
  'omd-delegate',
  'omd-install',
  ...MODE_CATALOG.map((skill: ModeSkill): string => skill.name),
];

describe('skill and rules channel parity', () => {
  let setupDir: string;
  let pluginDir: string;

  beforeEach(async () => {
    setupDir = await mkdtemp(join(tmpdir(), 'omd-setup-'));
    pluginDir = await mkdtemp(join(tmpdir(), 'omd-plugin-'));
    await setupLayer(setupDir);
    await buildPluginBundle(pluginDir);
  });

  afterEach(async () => {
    await rm(setupDir, { recursive: true, force: true });
    await rm(pluginDir, { recursive: true, force: true });
  });

  it('emits byte-identical rules content through both channels', async () => {
    const fromSetup: string = await readFile(
      join(setupDir, 'AGENTS.md'),
      'utf8',
    );
    const fromPlugin: string = await readFile(
      join(pluginDir, 'AGENTS.md'),
      'utf8',
    );
    expect(fromPlugin).toBe(fromSetup);
  });

  it('emits byte-identical skill content through both channels', async () => {
    for (const name of SHARED_SKILL_NAMES) {
      const fromSetup: string = await readFile(
        join(setupDir, '.devin', 'skills', name, 'SKILL.md'),
        'utf8',
      );
      const fromPlugin: string = await readFile(
        join(pluginDir, 'skills', name, 'SKILL.md'),
        'utf8',
      );
      expect(fromPlugin, name).toBe(fromSetup);
    }
  });
});
