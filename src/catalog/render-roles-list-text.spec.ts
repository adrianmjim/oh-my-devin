import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import type { RoleDiscovery } from './role-discovery';
import { renderRolesListText } from './render-roles-list-text';

function role(name: string, promptBody: string): RoleDefinition {
  return {
    name,
    engine: 'devin',
    agentType: null,
    model: null,
    tools: [],
    permissions: { allow: [], deny: [], ask: [] },
    outputArtifact: 'out.json',
    outputSchema: 'out.schema.json',
    maxTurns: 5,
    contextPolicy: 'isolated',
    wallTimeMs: null,
    promptBody,
  };
}

const ARCHITECT_BODY: string = [
  '## Mission',
  '',
  'You are the architect. You turn a requirement into a plan.',
].join('\n');

const REVIEWER_BODY: string = [
  '## Mission',
  '',
  'You are the reviewer. You judge the diff against the plan.',
].join('\n');

describe('renderRolesListText', () => {
  it('lists one role per line', () => {
    const discovery: RoleDiscovery = {
      roles: [
        role('architect', ARCHITECT_BODY),
        role('reviewer', REVIEWER_BODY),
      ],
      errors: [],
    };
    const lines: string[] = renderRolesListText(discovery).split('\n');
    expect(lines[0]).toContain('architect');
    expect(lines[1]).toContain('reviewer');
  });

  it('summarizes a sectioned body with its first line of prose', () => {
    const discovery: RoleDiscovery = {
      roles: [
        role('architect', ARCHITECT_BODY),
        role('reviewer', REVIEWER_BODY),
      ],
      errors: [],
    };
    const lines: string[] = renderRolesListText(discovery).split('\n');
    expect(lines[0]).toBe(
      'architect  You are the architect. You turn a requirement into a plan.',
    );
    expect(lines[1]).toBe(
      'reviewer  You are the reviewer. You judge the diff against the plan.',
    );
  });

  it('lists a role whose body carries no prose by name alone', () => {
    const discovery: RoleDiscovery = {
      roles: [role('architect', '## Mission\n\n## Boundaries')],
      errors: [],
    };

    expect(renderRolesListText(discovery)).toBe('architect');
  });

  it('states that no roles were found for an empty catalog', () => {
    const text: string = renderRolesListText({ roles: [], errors: [] });
    expect(text.toLowerCase()).toContain('no roles');
  });
});
