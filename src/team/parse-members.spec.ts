import { describe, expect, it } from 'vitest';
import { parseMembers } from './parse-members';
import { TeamDefinitionError } from './team-definition-error';

const KNOWN: readonly string[] = ['architect'];

describe('parseMembers', () => {
  it('parses a list of members', () => {
    expect(parseMembers([{ role: 'architect', count: 1 }], KNOWN)).toHaveLength(
      1,
    );
  });

  it('refuses a missing or empty member list', () => {
    expect(() => parseMembers(undefined, KNOWN)).toThrow(TeamDefinitionError);
    expect(() => parseMembers([], KNOWN)).toThrow(/non-empty/);
  });
});
