import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { userLevelLayerPath } from './user-level-layer-path';

const USER_CONFIG_DIR: string = join('/home', 'u', '.config', 'devin');

describe('userLevelLayerPath', () => {
  it('drops the engine project directory segment and rebases what remains', () => {
    expect(
      userLevelLayerPath(
        USER_CONFIG_DIR,
        join('.devin', 'agents', 'reviewer', 'AGENT.md'),
      ),
    ).toBe(join(USER_CONFIG_DIR, 'agents', 'reviewer', 'AGENT.md'));
  });

  it('rebases the schema path a role names onto the user config directory', () => {
    expect(
      userLevelLayerPath(
        USER_CONFIG_DIR,
        join('.devin', 'schemas', 'review.schema.json'),
      ),
    ).toBe(join(USER_CONFIG_DIR, 'schemas', 'review.schema.json'));
  });

  it('rebases a path outside the engine project directory verbatim', () => {
    expect(userLevelLayerPath(USER_CONFIG_DIR, 'AGENTS.md')).toBe(
      join(USER_CONFIG_DIR, 'AGENTS.md'),
    );
  });

  it('maps the engine project directory itself to the user config directory', () => {
    expect(userLevelLayerPath(USER_CONFIG_DIR, '.devin')).toBe(USER_CONFIG_DIR);
  });
});
