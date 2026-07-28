import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import { compileRunBundle } from './compile-run-bundle';
import { UsageError } from './usage-error';

function role(overrides: Partial<RoleDefinition>): RoleDefinition {
  return {
    name: 'worker',
    engine: 'devin',
    agentType: null,
    model: null,
    tools: ['read'],
    permissions: { allow: [], deny: [], ask: [] },
    outputArtifact: 'out.json',
    outputSchema: 'out.schema.json',
    maxTurns: 5,
    contextPolicy: 'isolated',
    wallTimeMs: null,
    writeScope: 'artifact',
    promptBody: 'Do the work.',
    ...overrides,
  };
}

describe('compileRunBundle', () => {
  it('compiles the agent config bundle of a role', () => {
    expect(compileRunBundle(role({}), '/tmp/omd-run').allowed_tools).toEqual([
      'read',
    ]);
  });

  it('reports a deny rule over its own artifact as a usage error', () => {
    expect(() =>
      compileRunBundle(
        role({
          permissions: { allow: [], deny: ['Write(out.json)'], ask: [] },
        }),
        '/tmp/omd-run',
      ),
    ).toThrow(UsageError);
  });
});
