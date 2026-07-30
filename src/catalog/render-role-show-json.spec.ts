import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import type { RoleContractJson } from './role-contract-json';
import { renderRoleShowJson } from './render-role-show-json';

const ROLE: RoleDefinition = {
  name: 'reviewer',
  engine: 'devin',
  agentType: null,
  model: null,
  tools: ['read'],
  permissions: { allow: ['Write(review.json)'], deny: [], ask: [] },
  outputArtifact: 'review.json',
  outputSchema: 'review.schema.json',
  maxTurns: 6,
  contextPolicy: 'isolated',
  wallTimeMs: null,
  writeScope: 'artifact',
  promptBody: '## Mission\n\nAssess the diff.\nThen write the verdict.',
};

describe('renderRoleShowJson', () => {
  it('renders the contract fields under their serialized names', () => {
    expect(renderRoleShowJson(ROLE)).toEqual({
      name: 'reviewer',
      engine: 'devin',
      agentType: null,
      model: null,
      tools: ['read'],
      permissions: { allow: ['Write(review.json)'], deny: [], ask: [] },
      output: 'review.json',
      schema: 'review.schema.json',
      maxTurns: 6,
      context: 'isolated',
      wallTimeMs: null,
      writeScope: 'artifact',
      promptSummary: 'Assess the diff.',
    });
  });

  it('summarizes the prompt rather than carrying it whole', () => {
    expect(renderRoleShowJson(ROLE).promptSummary).not.toContain('verdict');
  });

  it('summarizes a sectioned body with prose rather than its heading', () => {
    expect(renderRoleShowJson(ROLE).promptSummary).not.toContain('#');
  });

  it('reports no summary for a body that carries no prose', () => {
    expect(
      renderRoleShowJson({
        ...ROLE,
        promptBody: '## Mission\n\n## Boundaries',
      }).promptSummary,
    ).toBe('');
  });

  it('carries a declared worktree write scope', () => {
    expect(
      renderRoleShowJson({ ...ROLE, writeScope: 'worktree' }).writeScope,
    ).toBe('worktree');
  });

  it('carries a declared agent type and model verbatim', () => {
    const json: RoleContractJson = renderRoleShowJson({
      ...ROLE,
      agentType: 'reviewer',
      model: 'opus',
    });

    expect(json.agentType).toBe('reviewer');
    expect(json.model).toBe('opus');
  });
});
