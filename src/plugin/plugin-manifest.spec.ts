import { describe, expect, it } from 'vitest';
import { PLUGIN_MANIFEST } from './plugin-manifest';

describe('PLUGIN_MANIFEST', () => {
  it('names the plugin', () => {
    expect(JSON.parse(PLUGIN_MANIFEST)).toEqual({ name: 'oh-my-devin' });
  });

  it('is indented and newline-terminated', () => {
    expect(PLUGIN_MANIFEST).toContain('\n  ');
    expect(PLUGIN_MANIFEST.endsWith('\n')).toBe(true);
  });
});
