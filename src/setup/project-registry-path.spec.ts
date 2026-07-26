import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PROJECT_REGISTRY_PATH } from './project-registry-path';

describe('PROJECT_REGISTRY_PATH', () => {
  it('addresses the versioned hook registry inside the engine layer', () => {
    expect(PROJECT_REGISTRY_PATH).toBe(join('.devin', 'hooks.v1.json'));
  });

  it('stays project-relative so it can be reported as written', () => {
    expect(PROJECT_REGISTRY_PATH.startsWith('/')).toBe(false);
  });
});
