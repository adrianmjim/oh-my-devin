import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { layerFilePath } from './layer-file-path';

const PROJECT_DIR: string = join('/work', 'project');
const USER_CONFIG_DIR: string = join('/home', 'u', '.config', 'devin');
const RELATIVE_PATH: string = join('.devin', 'agents', 'reviewer', 'AGENT.md');

describe('layerFilePath', () => {
  it('joins the project-relative path onto the project directory at project level', () => {
    expect(layerFilePath('project', PROJECT_DIR, RELATIVE_PATH)).toBe(
      join(PROJECT_DIR, RELATIVE_PATH),
    );
  });

  it('rebases onto the user config directory at user level', () => {
    expect(layerFilePath('user', USER_CONFIG_DIR, RELATIVE_PATH)).toBe(
      join(USER_CONFIG_DIR, 'agents', 'reviewer', 'AGENT.md'),
    );
  });

  it('keeps a path outside the engine project directory under the project directory', () => {
    expect(layerFilePath('project', PROJECT_DIR, 'AGENTS.md')).toBe(
      join(PROJECT_DIR, 'AGENTS.md'),
    );
  });
});
