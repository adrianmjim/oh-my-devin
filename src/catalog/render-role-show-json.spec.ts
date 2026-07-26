import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
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
  promptBody: 'Assess the diff.\nThen write the verdict.',
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
      promptSummary: 'Assess the diff.',
    });
  });

  it('summarizes the prompt rather than carrying it whole', () => {
    expect(renderRoleShowJson(ROLE).promptSummary).not.toContain('verdict');
  });
});
