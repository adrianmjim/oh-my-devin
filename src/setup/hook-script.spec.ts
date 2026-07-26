import { describe, expect, it } from 'vitest';
import { HOOK_SCRIPT } from './hook-script';

describe('HOOK_SCRIPT', () => {
  it('is an executable node script', () => {
    expect(HOOK_SCRIPT.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('reads the persisted mode state', () => {
    expect(HOOK_SCRIPT).toContain('.omd/mode.json');
  });

  it('blocks a stop with unmet verification criteria', () => {
    expect(HOOK_SCRIPT).toContain('Unmet verification criteria for mode');
    expect(HOOK_SCRIPT).toContain("decision: 'block'");
  });

  it('injects the active mode context on the other phases', () => {
    expect(HOOK_SCRIPT).toContain('additionalContext');
    expect(HOOK_SCRIPT).toContain('Oh My Devin layer active.');
  });

  it('answers on stdout after stdin ends', () => {
    expect(HOOK_SCRIPT).toContain(
      'process.stdout.write(JSON.stringify(output))',
    );
  });
});
