import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import type { RoleContractJson } from './role-contract-json';
import { renderRoleShowJson } from './render-role-show-json';
import { renderRoleShowText } from './render-role-show-text';

const ROLE: RoleDefinition = {
  name: 'reviewer',
  engine: 'devin',
  agentType: 'reviewer',
  model: 'opus',
  tools: ['read', 'grep'],
  permissions: { allow: ['Write(review.json)'], deny: [], ask: [] },
  outputArtifact: 'review.json',
  outputSchema: 'review.schema.json',
  maxTurns: 8,
  contextPolicy: 'isolated',
  wallTimeMs: 600000,
  promptBody: 'You are the reviewer. Assess the diff.',
};

describe('renderRoleShowJson', () => {
  it('carries the full contract', () => {
    const json: RoleContractJson = renderRoleShowJson(ROLE);
    expect(json.name).toBe('reviewer');
    expect(json.engine).toBe('devin');
    expect(json.agentType).toBe('reviewer');
    expect(json.model).toBe('opus');
    expect(json.tools).toEqual(['read', 'grep']);
    expect(json.permissions).toEqual({
      allow: ['Write(review.json)'],
      deny: [],
      ask: [],
    });
    expect(json.output).toBe('review.json');
    expect(json.schema).toBe('review.schema.json');
    expect(json.maxTurns).toBe(8);
    expect(json.context).toBe('isolated');
    expect(json.wallTimeMs).toBe(600000);
  });
});

describe('renderRoleShowText', () => {
  it('includes every contract field label', () => {
    const text: string = renderRoleShowText(ROLE);
    for (const needle of [
      'reviewer',
      'devin',
      'opus',
      'read',
      'Write(review.json)',
      'review.json',
      'review.schema.json',
      '8',
      'isolated',
    ]) {
      expect(text).toContain(needle);
    }
  });
});
