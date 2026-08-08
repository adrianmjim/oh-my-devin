import { describe, expect, it } from 'vitest';
import { AGENT_CONFIG_LOG_SUFFIX } from './agent-config-log-suffix';

describe('AGENT_CONFIG_LOG_SUFFIX', () => {
  it('names the sidecar the stub records handed bundles in', () => {
    expect(AGENT_CONFIG_LOG_SUFFIX).toBe('.agent-config.jsonl');
  });
});
