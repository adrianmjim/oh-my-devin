import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { CouncilDeclaration } from './council-declaration';
import { loadCouncilDeclaration } from './load-council-declaration';

const COUNCIL_YAML: string = [
  'name: design-council',
  'seats:',
  '  - role: architect',
  '    lens: system-boundaries',
  '    proposer: true',
  '  - role: reviewer',
  '    lens: risk',
  '    contrarian: true',
  'deliberation:',
  '  rounds_cap: 3',
  '  blocking_threshold: high',
  'authority:',
  '  on_consent: human',
].join('\n');

describe('loadCouncilDeclaration', () => {
  let dir: string;

  async function scaffoldRole(name: string): Promise<void> {
    const roleDir: string = join(dir, '.devin', 'agents', name);
    await mkdir(roleDir, { recursive: true });
    const agentMd: string = [
      '---',
      `omd-output: ${name}.json`,
      `omd-schema: ${name}.schema.json`,
      'omd-max-turns: 6',
      '---',
      `You are the ${name}.`,
    ].join('\n');
    await writeFile(join(roleDir, 'AGENT.md'), agentMd, 'utf8');
  }

  async function writeCouncil(name: string, yaml: string): Promise<void> {
    const councilsDir: string = join(dir, '.devin', 'councils');
    await mkdir(councilsDir, { recursive: true });
    await writeFile(join(councilsDir, `${name}.yaml`), yaml, 'utf8');
  }

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-council-'));
    await scaffoldRole('architect');
    await scaffoldRole('reviewer');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('loads a council declaration validated against discovered roles', async () => {
    await writeCouncil('design-council', COUNCIL_YAML);

    const council: CouncilDeclaration = await loadCouncilDeclaration(
      dir,
      'design-council',
    );

    expect(council.name).toBe('design-council');
    expect(council.seats).toHaveLength(2);
    expect(council.seats[0]?.proposer).toBe(true);
    expect(council.seats[1]?.contrarian).toBe(true);
  });

  it('raises a usage error when the council file is missing', async () => {
    await expect(loadCouncilDeclaration(dir, 'ghost')).rejects.toThrow(
      UsageError,
    );
  });

  it('raises a usage error when a seat names an undefined role', async () => {
    const yaml: string = [
      'name: broken',
      'seats:',
      '  - role: phantom',
      '    lens: x',
      'deliberation:',
      '  rounds_cap: 2',
    ].join('\n');
    await writeCouncil('broken', yaml);
    await expect(loadCouncilDeclaration(dir, 'broken')).rejects.toThrow(
      UsageError,
    );
  });
});
