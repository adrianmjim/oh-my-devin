import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { InstallLevel } from '../layer/install-level';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RoleCandidate } from './role-candidate';
import { roleDefinitionCandidates } from './role-definition-candidates';

const PROJECT_DIR: string = join('/work', 'project');
const USER_CONFIG_DIR: string = join('/home', 'u', '.config', 'devin');

function levelsOf(
  candidates: readonly RoleCandidate[],
): readonly InstallLevel[] {
  return candidates.map(
    (candidate: RoleCandidate): InstallLevel => candidate.level,
  );
}

describe('roleDefinitionCandidates', () => {
  it('orders the project candidate before the user-level one', () => {
    const lookup: LayerLookup = {
      projectDir: PROJECT_DIR,
      userConfigDir: USER_CONFIG_DIR,
    };

    const candidates: readonly RoleCandidate[] = roleDefinitionCandidates(
      lookup,
      'reviewer',
    );

    expect(levelsOf(candidates)).toEqual(['project', 'user']);
    expect(candidates[0]?.definitionPath).toBe(
      join(PROJECT_DIR, '.devin', 'agents', 'reviewer', 'AGENT.md'),
    );
    expect(candidates[1]?.definitionPath).toBe(
      join(USER_CONFIG_DIR, 'agents', 'reviewer', 'AGENT.md'),
    );
  });

  it('carries the base directory each candidate resolves against', () => {
    const lookup: LayerLookup = {
      projectDir: PROJECT_DIR,
      userConfigDir: USER_CONFIG_DIR,
    };

    const candidates: readonly RoleCandidate[] = roleDefinitionCandidates(
      lookup,
      'reviewer',
    );

    expect(candidates[0]?.baseDir).toBe(PROJECT_DIR);
    expect(candidates[1]?.baseDir).toBe(USER_CONFIG_DIR);
  });

  it('omits the user-level candidate when no user-level directory is known', () => {
    const lookup: LayerLookup = {
      projectDir: PROJECT_DIR,
      userConfigDir: null,
    };

    const candidates: readonly RoleCandidate[] = roleDefinitionCandidates(
      lookup,
      'reviewer',
    );

    expect(levelsOf(candidates)).toEqual(['project']);
  });
});
