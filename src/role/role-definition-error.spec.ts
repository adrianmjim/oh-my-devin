import { describe, expect, it } from 'vitest';
import { RoleDefinitionError } from './role-definition-error';

describe('RoleDefinitionError', () => {
  it('is an error carrying its message', () => {
    const error: RoleDefinitionError = new RoleDefinitionError('no AGENT.md');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('no AGENT.md');
  });

  it('names itself so it survives serialization', () => {
    expect(new RoleDefinitionError('x').name).toBe('RoleDefinitionError');
  });
});
