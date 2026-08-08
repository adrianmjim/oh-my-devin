import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { modeStateRoot } from './mode-state-root';

describe('modeStateRoot', () => {
  it('resolves the session-scoped mode subtree under .omd', () => {
    expect(modeStateRoot('/project')).toBe(join('/project', '.omd', 'modes'));
  });
});
