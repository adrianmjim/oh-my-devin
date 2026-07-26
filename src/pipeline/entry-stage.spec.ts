import { describe, expect, it } from 'vitest';
import type { TeamDefinition } from '../team/team-definition';
import { entryStage } from './entry-stage';
import { PipelineError } from './pipeline-error';

function team(roles: readonly string[]): TeamDefinition {
  return {
    name: 'feature-team',
    members: roles.map((role: string) => ({
      role,
      count: 1,
      strategy: null,
    })),
    workflow: [],
  };
}

describe('entryStage', () => {
  it('is the role of the first member', () => {
    expect(entryStage(team(['architect', 'executor']))).toBe('architect');
  });

  it('refuses a team with no members', () => {
    expect(() => entryStage(team([]))).toThrow(PipelineError);
  });

  it('refuses a team that does not start with a pipeline stage', () => {
    expect(() => entryStage(team(['researcher']))).toThrow(/pipeline stage/);
  });
});
