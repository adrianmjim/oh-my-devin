import { describe, expect, it } from 'vitest';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import { PROBE_ROLE } from './probe-role';

describe('PROBE_ROLE', () => {
  it('is a minimal role the doctor can compile', () => {
    expect(PROBE_ROLE.name).toBe('omd-doctor-probe');
    expect(PROBE_ROLE.maxTurns).toBe(1);
    expect(PROBE_ROLE.tools).toEqual([]);
  });

  it('compiles into an agent config bundle', () => {
    expect(
      compileAgentConfigBundle(PROBE_ROLE, '/tmp/omd-doctor').allowed_tools,
    ).toEqual([]);
  });
});
