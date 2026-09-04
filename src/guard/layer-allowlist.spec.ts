import { describe, expect, it } from 'vitest';
import { LAYER_ALLOWLIST } from './layer-allowlist';

describe('LAYER_ALLOWLIST', () => {
  it('holds the layer paths and nothing else', () => {
    expect(LAYER_ALLOWLIST).toEqual(['.omd', '.devin', 'AGENTS.md']);
  });

  it('exempts no documentation or project configuration', () => {
    expect(LAYER_ALLOWLIST).not.toContain('docs');
    expect(LAYER_ALLOWLIST).not.toContain('package.json');
  });

  it('holds every entry as a project-relative path', () => {
    for (const entry of LAYER_ALLOWLIST) {
      expect(typeof entry).toBe('string');
      expect(entry.startsWith('/')).toBe(false);
    }
  });
});
