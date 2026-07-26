import { describe, expect, it } from 'vitest';
import { parseMember } from './parse-member';
import { TeamDefinitionError } from './team-definition-error';

const KNOWN: readonly string[] = ['architect'];

describe('parseMember', () => {
  it('parses a single-instance member with no strategy', () => {
    expect(parseMember({ role: 'architect', count: 1 }, 0, KNOWN)).toEqual({
      role: 'architect',
      count: 1,
      strategy: null,
    });
  });

  it('parses a multi-instance member with its strategy', () => {
    expect(
      parseMember(
        { role: 'architect', count: 2, strategy: 'parallel' },
        0,
        KNOWN,
      ),
    ).toMatchObject({ count: 2, strategy: 'parallel' });
  });

  it('refuses a member that is not a mapping', () => {
    expect(() => parseMember('architect', 1, KNOWN)).toThrow(
      TeamDefinitionError,
    );
  });

  it('refuses a member naming a role with no definition', () => {
    expect(() => parseMember({ role: 'ghost', count: 1 }, 0, KNOWN)).toThrow(
      /no definition/,
    );
  });

  it('refuses a count that is not a positive integer', () => {
    expect(() =>
      parseMember({ role: 'architect', count: 0 }, 0, KNOWN),
    ).toThrow(/positive integer/);
  });

  it('refuses a multi-instance member declaring no strategy', () => {
    expect(() =>
      parseMember({ role: 'architect', count: 2 }, 0, KNOWN),
    ).toThrow(/must declare a strategy/);
  });

  it('refuses an unknown strategy', () => {
    expect(() =>
      parseMember({ role: 'architect', count: 2, strategy: 'fast' }, 0, KNOWN),
    ).toThrow(/invalid strategy/);
  });
});
