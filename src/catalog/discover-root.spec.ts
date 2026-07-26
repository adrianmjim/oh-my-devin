import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import { discoverRoot } from './discover-root';
import type { DiscoveryAccumulator } from './discovery-accumulator';

const AGENT_MD: string = [
  '---',
  'omd-output: out.json',
  'omd-schema: out.schema.json',
  'omd-max-turns: 5',
  '---',
  'Do the work.',
].join('\n');

describe('discoverRoot', () => {
  let agentsDir: string;
  let accumulator: DiscoveryAccumulator;

  async function writeRole(name: string, content: string): Promise<void> {
    await mkdir(join(agentsDir, name), { recursive: true });
    await writeFile(join(agentsDir, name, 'AGENT.md'), content, 'utf8');
  }

  beforeEach(async () => {
    agentsDir = await mkdtemp(join(tmpdir(), 'omd-discover-root-'));
    accumulator = { roles: [], errors: [], seen: new Set<string>() };
  });

  afterEach(async () => {
    await rm(agentsDir, { recursive: true, force: true });
  });

  it('collects the roles it finds', async () => {
    await writeRole('worker', AGENT_MD);

    await discoverRoot(agentsDir, accumulator);

    expect(
      accumulator.roles.map((r: RoleDefinition): string => r.name),
    ).toEqual(['worker']);
    expect(accumulator.seen.has('worker')).toBe(true);
  });

  it('records a parse failure as an error, not a role', async () => {
    await writeRole('broken', 'no frontmatter');

    await discoverRoot(agentsDir, accumulator);

    expect(accumulator.roles).toEqual([]);
    expect(accumulator.errors[0]?.name).toBe('broken');
  });

  it('skips a role already seen at a higher-priority root', async () => {
    await writeRole('worker', AGENT_MD);
    accumulator.seen.add('worker');

    await discoverRoot(agentsDir, accumulator);

    expect(accumulator.roles).toEqual([]);
  });

  it('ignores a directory holding no definition', async () => {
    await mkdir(join(agentsDir, 'empty'), { recursive: true });

    await discoverRoot(agentsDir, accumulator);

    expect(accumulator.roles).toEqual([]);
    expect(accumulator.errors).toEqual([]);
  });
});
