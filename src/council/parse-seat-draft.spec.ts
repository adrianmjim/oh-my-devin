import { describe, expect, it } from 'vitest';
import type { WriteScope } from '../role/write-scope';
import { CouncilDeclarationError } from './council-declaration-error';
import { parseSeatDraft } from './parse-seat-draft';
import type { RoleWriteScopes } from '../catalog/role-write-scopes';

const KNOWN: RoleWriteScopes = new Map<string, WriteScope>([
  ['reviewer', 'artifact'],
]);

describe('parseSeatDraft', () => {
  it('parses a seat naming a known role and its lens', () => {
    expect(
      parseSeatDraft({ role: 'reviewer', lens: 'auth' }, 0, KNOWN),
    ).toEqual({
      role: 'reviewer',
      lens: 'auth',
      proposer: false,
      contrarian: false,
      model: null,
    });
  });

  it('carries the proposer, contrarian, and model declarations', () => {
    expect(
      parseSeatDraft(
        {
          role: 'reviewer',
          lens: 'auth',
          proposer: true,
          contrarian: true,
          model: 'fast',
        },
        0,
        KNOWN,
      ),
    ).toMatchObject({ proposer: true, contrarian: true, model: 'fast' });
  });

  it('refuses a seat that is not a mapping', () => {
    expect(() => parseSeatDraft('reviewer', 1, KNOWN)).toThrow(
      CouncilDeclarationError,
    );
  });

  it('refuses a seat naming a role with no definition', () => {
    expect(() =>
      parseSeatDraft({ role: 'ghost', lens: 'auth' }, 0, KNOWN),
    ).toThrow(/no definition/);
  });

  it('refuses a seat naming a worktree-scoped role, identifying seat and role', () => {
    const scopes: RoleWriteScopes = new Map<string, WriteScope>([
      ...KNOWN,
      ['executor', 'worktree'],
    ]);

    expect(() =>
      parseSeatDraft({ role: 'executor', lens: 'implementation' }, 2, scopes),
    ).toThrow(CouncilDeclarationError);
    expect(() =>
      parseSeatDraft({ role: 'executor', lens: 'implementation' }, 2, scopes),
    ).toThrow(/seats\[2\] "executor"/);
  });
});
