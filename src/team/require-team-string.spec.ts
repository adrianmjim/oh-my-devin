import { describe, expect, it } from 'vitest';
import { requireTeamString } from './require-team-string';
import { TeamDefinitionError } from './team-definition-error';

describe('requireTeamString', () => {
  it('yields a non-empty string', () => {
    expect(requireTeamString('default', 'name')).toBe('default');
  });

  it('refuses an empty string, naming the field', () => {
    expect(() => requireTeamString('', 'name')).toThrow(TeamDefinitionError);
    expect(() => requireTeamString('', 'name')).toThrow(/name/);
  });

  it('refuses a value that is not a string', () => {
    expect(() => requireTeamString(7, 'name')).toThrow(TeamDefinitionError);
  });
});
