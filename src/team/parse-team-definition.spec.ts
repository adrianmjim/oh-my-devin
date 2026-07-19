import { describe, expect, it } from 'vitest';
import type { TeamDefinition } from './team-definition';
import { TeamDefinitionError } from './team-definition-error';
import { parseTeamDefinition } from './parse-team-definition';

const KNOWN: readonly string[] = ['architect', 'executor', 'reviewer'];

const VALID: string = [
  'name: feature-team',
  'members:',
  '  - role: architect',
  '    count: 1',
  '  - role: executor',
  '    count: 1',
  '  - role: reviewer',
  '    count: 1',
  'workflow:',
  '  architect:',
  '    then: executor',
  '  executor:',
  '    then: reviewer',
  '  reviewer:',
  '    on_passed: done',
  '    on_blocked: executor',
].join('\n');

describe('parseTeamDefinition', () => {
  it('parses a well-formed three-stage team', () => {
    const team: TeamDefinition = parseTeamDefinition(VALID, KNOWN);

    expect(team.name).toBe('feature-team');
    expect(team.members.map((m) => m.role)).toEqual([
      'architect',
      'executor',
      'reviewer',
    ]);
    const reviewer = team.workflow.find((t) => t.from === 'reviewer');
    expect(reviewer?.outcomes).toEqual([
      { outcome: 'passed', to: 'done' },
      { outcome: 'blocked', to: 'executor' },
    ]);
    const architect = team.workflow.find((t) => t.from === 'architect');
    expect(architect?.then).toBe('executor');
  });

  it('parses a multi-instance member with its strategy', () => {
    const yaml: string = [
      'name: panel',
      'members:',
      '  - role: reviewer',
      '    count: 3',
      '    strategy: independent',
      'workflow:',
      '  reviewer:',
      '    then: done',
    ].join('\n');

    const team: TeamDefinition = parseTeamDefinition(yaml, KNOWN);
    expect(team.members[0]?.count).toBe(3);
    expect(team.members[0]?.strategy).toBe('independent');
  });

  it('rejects a multi-instance member with no strategy', () => {
    const yaml: string = [
      'name: t',
      'members:',
      '  - role: reviewer',
      '    count: 2',
      'workflow:',
      '  reviewer:',
      '    then: done',
    ].join('\n');
    expect(() => parseTeamDefinition(yaml, KNOWN)).toThrow(TeamDefinitionError);
  });

  it('rejects a strategy outside the vocabulary', () => {
    const yaml: string = [
      'name: t',
      'members:',
      '  - role: reviewer',
      '    count: 2',
      '    strategy: majority',
      'workflow:',
      '  reviewer:',
      '    then: done',
    ].join('\n');
    expect(() => parseTeamDefinition(yaml, KNOWN)).toThrow(/strategy/);
  });

  it('rejects a member naming an unknown role', () => {
    const yaml: string = [
      'name: t',
      'members:',
      '  - role: ghost',
      '    count: 1',
      'workflow:',
      '  ghost:',
      '    then: done',
    ].join('\n');
    expect(() => parseTeamDefinition(yaml, KNOWN)).toThrow(/ghost/);
  });

  it('accepts every outcome token of the consent vocabulary', () => {
    const yaml: string = [
      'name: t',
      'members:',
      '  - role: executor',
      '    count: 1',
      '  - role: reviewer',
      '    count: 1',
      'workflow:',
      '  executor:',
      '    then: reviewer',
      '  reviewer:',
      '    on_passed: done',
      '    on_blocked: executor',
      '    on_bankrupt: done',
    ].join('\n');

    const team: TeamDefinition = parseTeamDefinition(yaml, KNOWN);
    const reviewer = team.workflow.find((t) => t.from === 'reviewer');
    expect(reviewer?.outcomes.map((o) => o.outcome)).toEqual([
      'passed',
      'blocked',
      'bankrupt',
    ]);
  });

  it('rejects an outcome key outside the consent vocabulary naming the key', () => {
    const yaml: string = [
      'name: t',
      'members:',
      '  - role: reviewer',
      '    count: 1',
      'workflow:',
      '  reviewer:',
      '    on_accept: done',
    ].join('\n');

    expect(() => parseTeamDefinition(yaml, KNOWN)).toThrow(TeamDefinitionError);
    expect(() => parseTeamDefinition(yaml, KNOWN)).toThrow(/on_accept/);
  });

  it('rejects a workflow successor that is neither a member nor done', () => {
    const yaml: string = [
      'name: t',
      'members:',
      '  - role: architect',
      '    count: 1',
      'workflow:',
      '  architect:',
      '    then: nowhere',
    ].join('\n');
    expect(() => parseTeamDefinition(yaml, KNOWN)).toThrow(TeamDefinitionError);
  });
});
