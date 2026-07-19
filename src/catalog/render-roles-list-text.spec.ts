import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import type { RoleDiscovery } from './role-discovery';
import { renderRolesListText } from './render-roles-list-text';

function role(name: string): RoleDefinition {
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
    promptBody: 'You are the reviewer for the diff.',
  };
}

describe('renderRolesListText', () => {
  it('lists one role per line', () => {
    const discovery: RoleDiscovery = {
      roles: [role('architect'), role('reviewer')],
      errors: [],
    };
    const lines: string[] = renderRolesListText(discovery).split('\n');
    expect(lines[0]).toContain('architect');
    expect(lines[1]).toContain('reviewer');
  });

  it('states that no roles were found for an empty catalog', () => {
    const text: string = renderRolesListText({ roles: [], errors: [] });
    expect(text.toLowerCase()).toContain('no roles');
  });
});
