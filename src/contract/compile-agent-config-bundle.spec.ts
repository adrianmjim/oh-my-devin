import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import type { AgentConfigBundle } from './agent-config-bundle';
import { ContractCompilationError } from './contract-compilation-error';
import { compileAgentConfigBundle } from './compile-agent-config-bundle';

function role(overrides: Partial<RoleDefinition>): RoleDefinition {
  return {
    name: 'reviewer',
    engine: 'devin',
    agentType: null,
    model: 'opus',
    tools: ['read', 'grep'],
    permissions: {
      allow: ['Write(review.json)'],
      deny: [],
      ask: ['Write(**)'],
    },
    outputArtifact: 'review.json',
    outputSchema: 'schemas/review.schema.json',
    maxTurns: 8,
    contextPolicy: 'isolated',
    wallTimeMs: null,
    promptBody: 'You are the reviewer.',
    ...overrides,
  };
}

describe('compileAgentConfigBundle', () => {
  it('emits only contract fields — no omd extension keys, no model', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(role({}));

    expect(Object.keys(bundle).sort()).toEqual([
      'allowed_tools',
      'permissions',
      'system_instructions',
    ]);
    expect(JSON.stringify(bundle)).not.toContain('opus');
    expect(JSON.stringify(bundle)).not.toContain('max_turns');
    expect(JSON.stringify(bundle)).not.toContain('omd-');
  });

  it('carries tool visibility and wraps the prompt body in the preamble', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(role({}));

    expect(bundle.allowed_tools).toEqual(['read', 'grep']);
    expect(bundle.system_instructions).toHaveLength(2);
    expect(bundle.system_instructions[0]).toContain('review.json');
    expect(bundle.system_instructions[1]).toBe('You are the reviewer.');
  });

  it('guarantees the declared artifact is the writable allow path', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({ permissions: { allow: ['Read(**)'], deny: [], ask: [] } }),
    );

    expect(bundle.permissions.allow).toContain('Write(review.json)');
    expect(bundle.permissions.allow).toContain('Read(**)');
  });

  it('does not duplicate an already-declared artifact write allow', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(role({}));

    const writeAllows: readonly string[] = bundle.permissions.allow.filter(
      (rule: string): boolean => rule === 'Write(review.json)',
    );
    expect(writeAllows).toHaveLength(1);
  });

  it('rejects a second writable path in the allow list', () => {
    expect(() =>
      compileAgentConfigBundle(
        role({
          permissions: {
            allow: ['Write(review.json)', 'Write(other.json)'],
            deny: [],
            ask: [],
          },
        }),
      ),
    ).toThrow(ContractCompilationError);
  });

  it('rejects a deny rule that matches the declared artifact', () => {
    expect(() =>
      compileAgentConfigBundle(
        role({
          permissions: { allow: [], deny: ['Write(**)'], ask: [] },
        }),
      ),
    ).toThrow(ContractCompilationError);
  });

  it('passes a non-artifact write deny through beside an exec allowance', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({
        permissions: {
          allow: ['Exec(npm test)'],
          deny: ['Write(src/**)'],
          ask: [],
        },
      }),
    );

    expect(bundle.permissions.deny).toEqual(['Write(src/**)']);
    expect(bundle.permissions.allow).toEqual([
      'Write(review.json)',
      'Exec(npm test)',
    ]);
    const writable: readonly string[] = bundle.permissions.allow.filter(
      (rule: string): boolean => rule.startsWith('Write('),
    );
    expect(writable).toEqual(['Write(review.json)']);
  });

  it('preserves red-line deny rules that do not touch the artifact', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({ permissions: { allow: [], deny: ['Bash(rm*)'], ask: [] } }),
    );

    expect(bundle.permissions.deny).toEqual(['Bash(rm*)']);
  });
});
