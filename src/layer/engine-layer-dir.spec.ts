import { describe, expect, it } from 'vitest';
import { ENGINE_LAYER_DIR } from './engine-layer-dir';

describe('ENGINE_LAYER_DIR', () => {
  it('names the directory the engine reads its layer from', () => {
    expect(ENGINE_LAYER_DIR).toBe('.devin');
  });

  it('stays relative so it resolves against any base directory', () => {
    expect(ENGINE_LAYER_DIR.startsWith('/')).toBe(false);
  });
});
