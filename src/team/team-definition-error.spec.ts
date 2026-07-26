import { describe, expect, it } from 'vitest';
import { TeamDefinitionError } from './team-definition-error';

describe('TeamDefinitionError', () => {
  it('is an error carrying its message', () => {
    const error: TeamDefinitionError = new TeamDefinitionError(
      'members must be a list',
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('members must be a list');
  });

  it('names itself so it survives serialization', () => {
    expect(new TeamDefinitionError('x').name).toBe('TeamDefinitionError');
  });
});
