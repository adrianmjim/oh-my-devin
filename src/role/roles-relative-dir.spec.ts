import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ENGINE_LAYER_DIR } from '../layer/engine-layer-dir';
import { ROLES_RELATIVE_DIR } from './roles-relative-dir';

describe('ROLES_RELATIVE_DIR', () => {
  it('locates the role definitions inside the engine layer', () => {
    expect(ROLES_RELATIVE_DIR).toBe(join(ENGINE_LAYER_DIR, 'agents'));
  });

  it('stays relative so it resolves against any base directory', () => {
    expect(ROLES_RELATIVE_DIR.startsWith('/')).toBe(false);
  });
});
