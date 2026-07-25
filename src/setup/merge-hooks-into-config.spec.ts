import { describe, expect, it } from 'vitest';
import { mergeHooksIntoConfig } from './merge-hooks-into-config';
import { buildHooksEventMap } from './setup-templates';

const MAP = buildHooksEventMap('node /home/x/.config/devin/hooks/omd-mode.mjs');

type ParsedConfig = Record<string, unknown>;

function parse(text: string): ParsedConfig {
  return JSON.parse(text) as ParsedConfig;
}

describe('mergeHooksIntoConfig', () => {
  it('creates a config carrying only the hooks map when none exists', () => {
    const merged: ParsedConfig = parse(mergeHooksIntoConfig(null, MAP));
    expect(Object.keys(merged)).toEqual(['hooks']);
    expect(merged['hooks']).toEqual(MAP);
  });

  it('preserves the existing keys, including auth, while adding hooks', () => {
    const existing: string = JSON.stringify({
      version: 1,
      devin: { org_id: 'org-123' },
      theme_mode: 'dark',
    });
    const merged: ParsedConfig = parse(mergeHooksIntoConfig(existing, MAP));
    expect(merged['version']).toBe(1);
    expect(merged['devin']).toEqual({ org_id: 'org-123' });
    expect(merged['theme_mode']).toBe('dark');
    expect(merged['hooks']).toEqual(MAP);
  });

  it('replaces a pre-existing hooks key rather than nesting it', () => {
    const existing: string = JSON.stringify({
      version: 1,
      hooks: { SessionStart: [] },
    });
    const merged: ParsedConfig = parse(mergeHooksIntoConfig(existing, MAP));
    expect(merged['hooks']).toEqual(MAP);
    expect(merged['version']).toBe(1);
  });

  it('ends with a trailing newline', () => {
    expect(mergeHooksIntoConfig(null, MAP).endsWith('\n')).toBe(true);
  });

  it('refuses to clobber an unparseable config', () => {
    expect(() => mergeHooksIntoConfig('not json', MAP)).toThrow();
  });

  it('refuses to clobber a non-object config', () => {
    expect(() => mergeHooksIntoConfig('[1,2,3]', MAP)).toThrow();
  });
});
