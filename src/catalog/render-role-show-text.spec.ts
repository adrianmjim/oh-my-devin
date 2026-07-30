import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import { renderRoleShowText } from './render-role-show-text';

function role(overrides: Partial<RoleDefinition>): RoleDefinition {
  return {
    name: 'reviewer',
    engine: 'devin',
    agentType: null,
    model: null,
    tools: ['read'],
    permissions: { allow: [], deny: [], ask: [] },
    outputArtifact: 'review.json',
    outputSchema: 'review.schema.json',
    maxTurns: 6,
    contextPolicy: 'isolated',
    wallTimeMs: null,
    writeScope: 'artifact',
    promptBody: '## Mission\n\nAssess the diff.',
    ...overrides,
  };
}

describe('renderRoleShowText', () => {
  it('renders every contract field on its own line', () => {
    const text: string = renderRoleShowText(role({}));

    expect(text).toContain('name:            reviewer');
    expect(text).toContain('engine:          devin');
    expect(text).toContain('omd-output:      review.json');
    expect(text).toContain('omd-max-turns:   6');
    expect(text).toContain('omd-context:     isolated');
    expect(text).toContain('omd-write-scope: artifact');
  });

  it('states a declared worktree write scope', () => {
    expect(renderRoleShowText(role({ writeScope: 'worktree' }))).toContain(
      'omd-write-scope: worktree',
    );
  });

  it('marks the unset optional fields', () => {
    const text: string = renderRoleShowText(role({}));

    expect(text).toContain('agent_type:      (unset)');
    expect(text).toContain('model:           (engine default)');
    expect(text).toContain('omd-wall-time:   (unset)');
  });

  it('states a declared wall time in milliseconds', () => {
    expect(renderRoleShowText(role({ wallTimeMs: 5000 }))).toContain(
      'omd-wall-time:   5000ms',
    );
  });

  it('reads empty permission and tool lists as none', () => {
    const text: string = renderRoleShowText(role({ tools: [] }));

    expect(text).toContain('tools:           (none)');
    expect(text).toContain('allow=[(none)]');
  });

  it('lists the declared tools and permission rules', () => {
    const text: string = renderRoleShowText(
      role({
        tools: ['read', 'grep'],
        permissions: { allow: ['Write(review.json)'], deny: [], ask: [] },
      }),
    );

    expect(text).toContain('tools:           read, grep');
    expect(text).toContain('allow=[Write(review.json)]');
  });

  it('summarizes the prompt body with its first line of prose', () => {
    expect(renderRoleShowText(role({}))).toContain(
      'summary:         Assess the diff.',
    );
  });

  it('leaves the summary empty for a body that carries no prose', () => {
    const lines: readonly string[] = renderRoleShowText(
      role({ promptBody: '## Mission\n\n## Boundaries' }),
    ).split('\n');

    expect(lines[lines.length - 1]?.trimEnd()).toBe('summary:');
  });
});
