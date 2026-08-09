import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { projectConfigPath } from './project-config-path';

describe('projectConfigPath', () => {
  it('places the project configuration inside the layer directory', () => {
    expect(projectConfigPath('/project')).toBe(
      join('/project', '.omd', 'config.yaml'),
    );
  });
});
