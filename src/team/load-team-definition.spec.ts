import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
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
  let userConfigDir: string;
  let lookup: LayerLookup;

  async function scaffoldRole(
    name: string,
    writeScope?: 'artifact' | 'worktree',
  ): Promise<void> {
    const roleDir: string = join(dir, '.devin', 'agents', name);
    await mkdir(roleDir, { recursive: true });
    const agentMd: string = [
      '---',
      `omd-output: ${name}.json`,
      `omd-schema: ${name}.schema.json`,
      'omd-max-turns: 6',
      ...(writeScope === undefined ? [] : [`omd-write-scope: ${writeScope}`]),
      '---',
      `You are the ${name}.`,
    ].join('\n');
    await writeFile(join(roleDir, 'AGENT.md'), agentMd, 'utf8');
  }

  async function scaffoldUserRole(name: string): Promise<void> {
    const roleDir: string = join(userConfigDir, 'agents', name);
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
    userConfigDir = await mkdtemp(join(tmpdir(), 'omd-team-user-'));
    lookup = { projectDir: dir, userConfigDir };
    await scaffoldRole('architect');
    await scaffoldRole('executor');
    await scaffoldRole('reviewer');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(userConfigDir, { recursive: true, force: true });
  });

  it('loads a team declaration and validates its roles against discovery', async () => {
    await writeTeam('feature-team', TEAM_YAML);

    const team: TeamDefinition = await loadTeamDefinition(
      lookup,
      'feature-team',
    );

    expect(team.name).toBe('feature-team');
    expect(team.members.map((m) => m.role)).toEqual([
      'architect',
      'executor',
      'reviewer',
    ]);
  });

  it('raises a usage error naming a missing non-default team without the setup remedy', async () => {
    await expect(loadTeamDefinition(lookup, 'ghost')).rejects.toThrow(
      UsageError,
    );
    await expect(loadTeamDefinition(lookup, 'ghost')).rejects.toThrow(/ghost/);
    await expect(loadTeamDefinition(lookup, 'ghost')).rejects.not.toThrow(
      /omd setup/,
    );
  });

  it('points a missing default team at omd setup as the remedy', async () => {
    await expect(loadTeamDefinition(lookup, 'default')).rejects.toThrow(
      UsageError,
    );
    await expect(loadTeamDefinition(lookup, 'default')).rejects.toThrow(
      /omd setup/,
    );
  });

  it('raises a usage error when the declaration is malformed', async () => {
    await writeTeam('broken', 'name: broken\nmembers: []\n');
    await expect(loadTeamDefinition(lookup, 'broken')).rejects.toThrow(
      UsageError,
    );
  });

  it('validates a project team declaration naming a user-level role', async () => {
    await rm(join(dir, '.devin', 'agents', 'reviewer'), {
      recursive: true,
      force: true,
    });
    await scaffoldUserRole('reviewer');
    await writeTeam('feature-team', TEAM_YAML);

    const team: TeamDefinition = await loadTeamDefinition(
      lookup,
      'feature-team',
    );

    expect(team.members.map((m) => m.role)).toContain('reviewer');
  });

  it('loads a team whose single worktree-scoped member is the executor', async () => {
    await rm(join(dir, '.devin', 'agents', 'executor'), {
      recursive: true,
      force: true,
    });
    await scaffoldRole('executor', 'worktree');
    await writeTeam('feature-team', TEAM_YAML);

    const team: TeamDefinition = await loadTeamDefinition(
      lookup,
      'feature-team',
    );

    expect(team.members.map((m) => m.role)).toContain('executor');
  });

  it('raises a usage error when two members resolve to worktree-scoped roles', async () => {
    await rm(join(dir, '.devin', 'agents', 'executor'), {
      recursive: true,
      force: true,
    });
    await scaffoldRole('executor', 'worktree');
    await scaffoldRole('builder', 'worktree');
    const yaml: string = [
      'name: twin-builders',
      'members:',
      '  - role: executor',
      '    count: 1',
      '  - role: builder',
      '    count: 1',
      'workflow:',
      '  executor:',
      '    then: builder',
      '  builder:',
      '    then: done',
    ].join('\n');
    await writeTeam('twin-builders', yaml);

    await expect(loadTeamDefinition(lookup, 'twin-builders')).rejects.toThrow(
      UsageError,
    );
    await expect(loadTeamDefinition(lookup, 'twin-builders')).rejects.toThrow(
      /"builder" declares the "worktree" write scope, but "executor" already holds it/,
    );
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
    await expect(loadTeamDefinition(lookup, 'ghosts')).rejects.toThrow(
      UsageError,
    );
  });
});
