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
  'omd-write-scope: artifact',
  '---',
  '',
  'You are the reviewer. Assess the diff and write review.json.',
  '',
].join('\n');

const INSTALLED_AGENT_MD: string = [
  '---',
  'omd-output: out.json',
  'omd-schema: out.schema.json',
  'omd-max-turns: 5',
  '---',
  '<!-- omd:begin id=role-worker version=0.0.0 digest=sha256:abc -->',
  '## Mission',
  '',
  'You are the worker.',
  '<!-- omd:end id=role-worker -->',
  '',
  'My own note.',
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
    expect(role.writeScope).toBe('artifact');
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
    expect(role.writeScope).toBe('artifact');
    expect(role.promptBody).toBe('Do the work.');
  });

  it('parses the worktree write scope', () => {
    const md: string = [
      '---',
      'omd-output: evidence.json',
      'omd-schema: evidence.schema.json',
      'omd-max-turns: 12',
      'omd-write-scope: worktree',
      '---',
      'Implement the architecture.',
    ].join('\n');

    const role: RoleDefinition = parseRoleDefinition(md, 'executor');

    expect(role.writeScope).toBe('worktree');
  });

  it('excludes the owned-region markers from the prompt body', () => {
    const role: RoleDefinition = parseRoleDefinition(
      INSTALLED_AGENT_MD,
      'worker',
    );

    expect(role.promptBody).toBe(
      ['## Mission', '', 'You are the worker.', '', 'My own note.'].join('\n'),
    );
    expect(role.promptBody).not.toContain('omd:begin');
    expect(role.promptBody).not.toContain('omd:end');
  });

  it('ignores unrecognized omd-* keys and other unknown frontmatter keys', () => {
    const md: string = [
      '---',
      'omd-output: out.json',
      'omd-schema: out.schema.json',
      'omd-max-turns: 5',
      'omd-council: quorum',
      'omd-retry-policy: exponential',
      'description: used by another tool',
      'color: cyan',
      '---',
      '',
      'Do the work.',
    ].join('\n');

    const role: RoleDefinition = parseRoleDefinition(md, 'worker');
    const baseline: RoleDefinition = parseRoleDefinition(
      MINIMAL_AGENT_MD,
      'worker',
    );

    expect(role).toEqual(baseline);
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

  it('throws when omd-output traverses out of the working directory', () => {
    const md: string = [
      '---',
      'omd-output: ../evidence.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(RoleDefinitionError);
    expect(() => parseRoleDefinition(md, 'x')).toThrow(
      /"omd-output" must be a relative path inside the working directory: "\.\.\/evidence\.json"/,
    );
  });

  it('throws when omd-output is an absolute path', () => {
    const md: string = [
      '---',
      'omd-output: /tmp/evidence.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/omd-output/);
  });

  it('accepts a nested relative omd-output path', () => {
    const md: string = [
      '---',
      'omd-output: reports/evidence.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      '---',
      'body',
    ].join('\n');
    expect(parseRoleDefinition(md, 'x').outputArtifact).toBe(
      'reports/evidence.json',
    );
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

  it('throws on an unknown write scope', () => {
    const md: string = [
      '---',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      'omd-write-scope: repository',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(RoleDefinitionError);
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/omd-write-scope/);
  });

  it('parses a declared memory selection', () => {
    const md: string = [
      '---',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      'omd-memory:',
      '  - notepad',
      '  - profile',
      '---',
      'body',
    ].join('\n');

    const role: RoleDefinition = parseRoleDefinition(md, 'x');

    expect(role.memorySelection).toEqual(['notepad', 'profile']);
  });

  it('reads an omitted memory selection as none', () => {
    expect(
      parseRoleDefinition(MINIMAL_AGENT_MD, 'worker').memorySelection,
    ).toEqual([]);
  });

  it('throws on a memory class outside the vocabulary', () => {
    const md: string = [
      '---',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      'omd-memory:',
      '  - transcripts',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(RoleDefinitionError);
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/omd-memory/);
  });

  it('parses the knowledge class as contractual vocabulary', () => {
    const md: string = [
      '---',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      'omd-memory:',
      '  - knowledge',
      '---',
      'body',
    ].join('\n');

    expect(parseRoleDefinition(md, 'x').memorySelection).toEqual(['knowledge']);
  });

  it('throws on the rules class, which is not contractual vocabulary', () => {
    const md: string = [
      '---',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      'omd-memory:',
      '  - rules',
      '---',
      'body',
    ].join('\n');

    expect(() => parseRoleDefinition(md, 'x')).toThrow(RoleDefinitionError);
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/omd-memory/);
  });

  it('throws on a memory selection that is not a list', () => {
    const md: string = [
      '---',
      'omd-output: o.json',
      'omd-schema: s.json',
      'omd-max-turns: 3',
      'omd-memory: notepad',
      '---',
      'body',
    ].join('\n');
    expect(() => parseRoleDefinition(md, 'x')).toThrow(/omd-memory/);
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
