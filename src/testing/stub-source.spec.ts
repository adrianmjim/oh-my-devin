import { describe, expect, it } from 'vitest';
import { STUB_LOG_ENV } from './stub-log-env';
import { STUB_SCRIPT_ENV } from './stub-script-env';
import { STUB_SOURCE } from './stub-source';

describe('STUB_SOURCE', () => {
  it('is an executable node script', () => {
    expect(STUB_SOURCE.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('reads its script and log paths from the environment', () => {
    expect(STUB_SOURCE).toContain(STUB_SCRIPT_ENV);
    expect(STUB_SOURCE).toContain(STUB_LOG_ENV);
  });

  it('logs every invocation as a JSON line', () => {
    expect(STUB_SOURCE).toContain("JSON.stringify({ command: 'devin', args })");
  });

  it('answers the scripted turn or fails loudly', () => {
    expect(STUB_SOURCE).toContain("fail('no scripted turn response left')");
  });
});
