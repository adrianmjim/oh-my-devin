import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import type { RoleListEntry } from './role-list-entry';
import { renderRolesListJson } from './render-roles-list-json';

const ROLE: RoleDefinition = {
  name: 'reviewer',
  engine: 'devin',
  agentType: 'reviewer',
  model: 'opus',
  tools: ['read'],
  permissions: { allow: [], deny: [], ask: [] },
  outputArtifact: 'review.json',
  outputSchema: 'review.schema.json',
  maxTurns: 8,
  contextPolicy: 'isolated',
  wallTimeMs: null,
  promptBody: 'You are the reviewer.',
};

describe('renderRolesListJson', () => {
  it('emits one object per role with exactly the fixed field set', () => {
    const entries: readonly RoleListEntry[] = renderRolesListJson([ROLE]);
    expect(entries).toHaveLength(1);
    expect(Object.keys(entries[0] ?? {}).sort()).toEqual([
      'agentType',
      'context',
      'engine',
      'maxTurns',
      'model',
      'name',
      'output',
      'schema',
    ]);
  });

  it('maps the role fields onto the entry', () => {
    const entry: RoleListEntry | undefined = renderRolesListJson([ROLE])[0];
    expect(entry?.name).toBe('reviewer');
    expect(entry?.output).toBe('review.json');
    expect(entry?.context).toBe('isolated');
    expect(entry?.engine).toBe('devin');
  });
});
