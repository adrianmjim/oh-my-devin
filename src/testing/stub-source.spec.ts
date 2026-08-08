import { describe, expect, it } from 'vitest';
import { AGENT_CONFIG_LOG_SUFFIX } from './agent-config-log-suffix';
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

  it('records the agent config bundle it was handed', () => {
    expect(STUB_SOURCE).toContain("args.indexOf('--agent-config')");
    expect(STUB_SOURCE).toContain(AGENT_CONFIG_LOG_SUFFIX);
  });

  it('writes the scripted artifact for the turn it is answering', () => {
    expect(STUB_SOURCE).toContain('script.artifactWrites');
    expect(STUB_SOURCE).toContain(
      "writeFileSync(write.path, write.content, 'utf8')",
    );
  });

  it('answers the scripted turn or fails loudly', () => {
    expect(STUB_SOURCE).toContain("fail('no scripted turn response left')");
  });
});
