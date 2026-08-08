import { describe, expect, it } from 'vitest';
import { EMPTY_MEMORY_DELIVERY } from '../memory/empty-memory-delivery';
import { MemoryStorePaths } from '../memory/memory-store-paths';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import type { AgentConfigBundle } from './agent-config-bundle';
import { ContractCompilationError } from './contract-compilation-error';
import { compileAgentConfigBundle } from './compile-agent-config-bundle';
import { parsePermissionRule } from './parse-permission-rule';
import { permissionRuleMatchesPath } from './permission-rule-matches-path';
import { WRITE_VERB } from './write-verb';

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
    writeScope: 'artifact',
    memorySelection: [],
    promptBody: 'You are the reviewer.',
    ...overrides,
  };
}

const PROJECT: string = '/tmp/omd';
const WORKTREE: string = '/tmp/omd/.omd/worktrees/executor';

function admitsWriteTo(bundle: AgentConfigBundle, path: string): boolean {
  return bundle.permissions.allow.some((raw: string): boolean =>
    permissionRuleMatchesPath(parsePermissionRule(raw), WRITE_VERB, path),
  );
}

describe('compileAgentConfigBundle', () => {
  it('emits only contract fields — no omd extension keys, no model', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({}),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

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
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({}),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    expect(bundle.allowed_tools).toEqual(['read', 'grep']);
    expect(bundle.system_instructions).toHaveLength(2);
    expect(bundle.system_instructions[0]).toContain('review.json');
    expect(bundle.system_instructions[1]).toBe('You are the reviewer.');
  });

  it('guarantees the declared artifact is the writable allow path', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({ permissions: { allow: ['Read(**)'], deny: [], ask: [] } }),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    expect(bundle.permissions.allow).toContain('Write(review.json)');
    expect(bundle.permissions.allow).toContain('Read(**)');
  });

  it('does not duplicate an already-declared artifact write allow', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({}),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

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
        WORKTREE,
        EMPTY_MEMORY_DELIVERY,
      ),
    ).toThrow(ContractCompilationError);
  });

  it('rejects a deny rule that matches the declared artifact', () => {
    expect(() =>
      compileAgentConfigBundle(
        role({
          permissions: { allow: [], deny: ['Write(**)'], ask: [] },
        }),
        WORKTREE,
        EMPTY_MEMORY_DELIVERY,
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
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
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
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    expect(bundle.permissions.deny).toEqual(['Bash(rm*)']);
  });

  it('sends no region marker as system instructions for an installed role', () => {
    const installed: RoleDefinition = parseRoleDefinition(
      [
        '---',
        'omd-output: review.json',
        'omd-schema: schemas/review.schema.json',
        'omd-max-turns: 8',
        '---',
        '<!-- omd:begin id=role-reviewer version=0.0.0 digest=sha256:abc -->',
        '## Mission',
        '',
        'You are the reviewer.',
        '<!-- omd:end id=role-reviewer -->',
        '',
      ].join('\n'),
      'reviewer',
    );

    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      installed,
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    expect(bundle.system_instructions[1]).toBe(
      ['## Mission', '', 'You are the reviewer.'].join('\n'),
    );
    expect(JSON.stringify(bundle)).not.toContain('omd:begin');
    expect(JSON.stringify(bundle)).not.toContain('omd:end');
  });

  it('grants an artifact-scoped role nothing beyond its artifact', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({ writeScope: 'artifact' }),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    const writable: readonly string[] = bundle.permissions.allow.filter(
      (rule: string): boolean => rule.startsWith('Write('),
    );
    expect(writable).toEqual(['Write(review.json)']);
    expect(JSON.stringify(bundle)).not.toContain(WORKTREE);
  });

  it('grants a worktree-scoped role the working directory and its artifact', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({
        name: 'executor',
        outputArtifact: 'evidence.json',
        permissions: { allow: [], deny: [], ask: [] },
        writeScope: 'worktree',
      }),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    const writable: readonly string[] = bundle.permissions.allow.filter(
      (rule: string): boolean => rule.startsWith('Write('),
    );
    expect(writable).toEqual(['Write(evidence.json)', `Write(${WORKTREE}/**)`]);
  });

  it('adds no deny rule for the worktree boundary', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({
        permissions: { allow: [], deny: [], ask: [] },
        writeScope: 'worktree',
      }),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    expect(bundle.permissions.deny).toEqual([]);
  });

  it('rejects an authored write beyond the artifact under worktree scope', () => {
    expect(() =>
      compileAgentConfigBundle(
        role({
          permissions: { allow: ['Write(src/**)'], deny: [], ask: [] },
          writeScope: 'worktree',
        }),
        WORKTREE,
        EMPTY_MEMORY_DELIVERY,
      ),
    ).toThrow(ContractCompilationError);
  });

  it('admits no write under the memory subtree for an artifact-scoped role', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({}),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    expect(admitsWriteTo(bundle, '.omd/memory/notepad.json')).toBe(false);
    expect(admitsWriteTo(bundle, '.omd/memory/profile.json')).toBe(false);
    expect(admitsWriteTo(bundle, new MemoryStorePaths(PROJECT).notepad)).toBe(
      false,
    );
  });

  it('admits no write under the project memory subtree for a worktree-scoped role', () => {
    const bundle: AgentConfigBundle = compileAgentConfigBundle(
      role({
        writeScope: 'worktree',
        outputArtifact: 'evidence.json',
        permissions: { allow: [], deny: [], ask: [] },
      }),
      WORKTREE,
      EMPTY_MEMORY_DELIVERY,
    );

    expect(admitsWriteTo(bundle, new MemoryStorePaths(PROJECT).notepad)).toBe(
      false,
    );
    expect(admitsWriteTo(bundle, new MemoryStorePaths(PROJECT).profile)).toBe(
      false,
    );
  });

  it('rejects a role whose artifact would land in the memory subtree', () => {
    expect(() =>
      compileAgentConfigBundle(
        role({
          outputArtifact: '.omd/memory/notepad.json',
          permissions: { allow: [], deny: [], ask: [] },
        }),
        WORKTREE,
        EMPTY_MEMORY_DELIVERY,
      ),
    ).toThrow(ContractCompilationError);
  });

  it('rejects an authored allow rule that reaches into the memory subtree', () => {
    expect(() =>
      compileAgentConfigBundle(
        role({
          permissions: {
            allow: ['Write(.omd/memory/**)'],
            deny: [],
            ask: [],
          },
        }),
        WORKTREE,
        EMPTY_MEMORY_DELIVERY,
      ),
    ).toThrow(ContractCompilationError);
  });
});
