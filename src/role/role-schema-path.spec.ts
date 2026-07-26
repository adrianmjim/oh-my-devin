import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { RoleCandidate } from './role-candidate';
import { roleSchemaPath } from './role-schema-path';

const PROJECT_DIR: string = join('/work', 'project');
const USER_CONFIG_DIR: string = join('/home', 'u', '.config', 'devin');

const PROJECT_CANDIDATE: RoleCandidate = {
  level: 'project',
  baseDir: PROJECT_DIR,
  definitionPath: join(PROJECT_DIR, '.devin', 'agents', 'reviewer', 'AGENT.md'),
};

const USER_CANDIDATE: RoleCandidate = {
  level: 'user',
  baseDir: USER_CONFIG_DIR,
  definitionPath: join(USER_CONFIG_DIR, 'agents', 'reviewer', 'AGENT.md'),
};

describe('roleSchemaPath', () => {
  it('resolves a project role schema against the project directory', () => {
    expect(
      roleSchemaPath(
        PROJECT_CANDIDATE,
        join('.devin', 'schemas', 'review.schema.json'),
      ),
    ).toBe(join(PROJECT_DIR, '.devin', 'schemas', 'review.schema.json'));
  });

  it('resolves a user-level role schema against the user config directory', () => {
    expect(
      roleSchemaPath(
        USER_CANDIDATE,
        join('.devin', 'schemas', 'review.schema.json'),
      ),
    ).toBe(join(USER_CONFIG_DIR, 'schemas', 'review.schema.json'));
  });

  it('resolves a schema named without the engine directory against the same base', () => {
    expect(roleSchemaPath(USER_CANDIDATE, 'review.schema.json')).toBe(
      join(USER_CONFIG_DIR, 'review.schema.json'),
    );
  });
});
