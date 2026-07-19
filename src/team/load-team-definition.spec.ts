import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { TeamDefinition } from './team-definition';
import { loadTeamDefinition } from './load-team-definition';

const TEAM_YAML: string = [
  'name: feature-team',
  'members:',
  '  - role: architect',
  '    count: 1',
  '  - role: executor',
  '    count: 1',
  '  - role: reviewer',
  '    count: 1',
  'workflow:',
  '  architect:',
  '    then: executor',
  '  executor:',
  '    then: reviewer',
  '  reviewer:',
  '    on_passed: done',
].join('\n');

describe('loadTeamDefinition', () => {
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

  async function writeTeam(name: string, yaml: string): Promise<void> {
    const teamsDir: string = join(dir, '.devin', 'teams');
    await mkdir(teamsDir, { recursive: true });
    await writeFile(join(teamsDir, `${name}.yaml`), yaml, 'utf8');
  }

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-team-'));
    await scaffoldRole('architect');
    await scaffoldRole('executor');
    await scaffoldRole('reviewer');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('loads a team declaration and validates its roles against discovery', async () => {
    await writeTeam('feature-team', TEAM_YAML);

    const team: TeamDefinition = await loadTeamDefinition(dir, 'feature-team');

    expect(team.name).toBe('feature-team');
    expect(team.members.map((m) => m.role)).toEqual([
      'architect',
      'executor',
      'reviewer',
    ]);
  });

  it('raises a usage error when the team file is missing', async () => {
    await expect(loadTeamDefinition(dir, 'ghost')).rejects.toThrow(UsageError);
  });

  it('raises a usage error when the declaration is malformed', async () => {
    await writeTeam('broken', 'name: broken\nmembers: []\n');
    await expect(loadTeamDefinition(dir, 'broken')).rejects.toThrow(UsageError);
  });

  it('raises a usage error when a member names an undefined role', async () => {
    const yaml: string = [
      'name: ghosts',
      'members:',
      '  - role: phantom',
      '    count: 1',
      'workflow:',
      '  phantom:',
      '    then: done',
    ].join('\n');
    await writeTeam('ghosts', yaml);
    await expect(loadTeamDefinition(dir, 'ghosts')).rejects.toThrow(UsageError);
  });
});
