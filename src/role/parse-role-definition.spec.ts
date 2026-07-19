import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from './role-definition';
import { RoleDefinitionError } from './role-definition-error';
import { parseRoleDefinition } from './parse-role-definition';

const FULL_AGENT_MD: string = [
  '---',
  'model: opus',
  'engine: devin',
  'agent_type: reviewer',
  'allowed-tools:',
  '  - read',
  '  - grep',
  'permissions:',
  '  allow:',
  '    - "Write(review.json)"',
  '  deny:',
  '    - "Bash(rm*)"',
  '  ask:',
  '    - "Write(**)"',
  'omd-output: review.json',
  'omd-schema: schemas/review.schema.json',
  'omd-max-turns: 8',
  'omd-context: isolated',
  'omd-wall-time: 10m',
  '---',
  '',
  'You are the reviewer. Assess the diff and write review.json.',
  '',
].join('\n');

const MINIMAL_AGENT_MD: string = [
  '---',
  'omd-output: out.json',
  'omd-schema: out.schema.json',
  'omd-max-turns: 5',
  '---',
  '',
  'Do the work.',
].join('\n');

describe('parseRoleDefinition', () => {
  it('parses native frontmatter, omd-* keys, and the prompt body', () => {
    const role: RoleDefinition = parseRoleDefinition(FULL_AGENT_MD, 'reviewer');

    expect(role.name).toBe('reviewer');
    expect(role.engine).toBe('devin');
    expect(role.agentType).toBe('reviewer');
    expect(role.model).toBe('opus');
    expect(role.tools).toEqual(['read', 'grep']);
    expect(role.permissions).toEqual({
      allow: ['Write(review.json)'],
      deny: ['Bash(rm*)'],
      ask: ['Write(**)'],
    });
    expect(role.outputArtifact).toBe('review.json');
    expect(role.outputSchema).toBe('schemas/review.schema.json');
    expect(role.maxTurns).toBe(8);
    expect(role.contextPolicy).toBe('isolated');
    expect(role.wallTimeMs).toBe(600000);
    expect(role.promptBody).toBe(
      'You are the reviewer. Assess the diff and write review.json.',
    );
  });

  it('applies defaults for omitted optional fields', () => {
    const role: RoleDefinition = parseRoleDefinition(
      MINIMAL_AGENT_MD,
      'worker',
    );

    expect(role.engine).toBe('devin');
    expect(role.agentType).toBeNull();
    expect(role.model).toBeNull();
    expect(role.tools).toEqual([]);
    expect(role.permissions).toEqual({ allow: [], deny: [], ask: [] });
    expect(role.contextPolicy).toBe('isolated');
    expect(role.wallTimeMs).toBeNull();
    expect(role.promptBody).toBe('Do the work.');
  });

  it('throws when there is no frontmatter', () => {
    expect(() =>
      parseRoleDefinition('just a body, no frontmatter', 'x'),
    ).toThrow(RoleDefinitionError);
  });

  it('throws when a required omd-* key is missing', () => {
    const md: string = [
      '---',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/omd-output/);
  });

  it('throws when omd-max-turns is not a positive integer', () => {
    const md: string = [
      '---',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 0',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/omd-max-turns/);
  });

  it('throws on an unknown context policy', () => {
    const md: string = [
      '---',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      'omd-context: everything',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/omd-context/);
  });

  it('throws on an unsupported engine value', () => {
    const md: string = [
      '---',
      'engine: cascade',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/engine/);
  });
});
