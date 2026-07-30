import { describe, expect, it } from 'vitest';
import type { RoleWriteScopes } from '../catalog/role-write-scopes';
import type { WriteScope } from '../role/write-scope';
import type { TeamMember } from './team-member';
import { TeamDefinitionError } from './team-definition-error';
import { requireSingleWorktreeMember } from './require-single-worktree-member';

const SCOPES: RoleWriteScopes = new Map<string, WriteScope>([
  ['architect', 'artifact'],
  ['executor', 'worktree'],
  ['builder', 'worktree'],
  ['reviewer', 'artifact'],
]);

function member(role: string): TeamMember {
  return { role, count: 1, strategy: null };
}

describe('requireSingleWorktreeMember', () => {
  it('accepts a team whose members are all artifact-scoped', () => {
    expect(() => {
      requireSingleWorktreeMember(
        [member('architect'), member('reviewer')],
        SCOPES,
      );
    }).not.toThrow();
  });

  it('accepts a team holding a single worktree-scoped member', () => {
    expect(() => {
      requireSingleWorktreeMember(
        [member('architect'), member('executor'), member('reviewer')],
        SCOPES,
      );
    }).not.toThrow();
  });

  it('rejects a worktree-scoped member declaring more than one instance', () => {
    const members: readonly TeamMember[] = [
      { role: 'executor', count: 2, strategy: 'parallel' },
    ];

    expect(() => {
      requireSingleWorktreeMember(members, SCOPES);
    }).toThrow(TeamDefinitionError);
    expect(() => {
      requireSingleWorktreeMember(members, SCOPES);
    }).toThrow(
      /members\[0\] "executor" declares the "worktree" write scope with more than one instance/,
    );
  });

  it('rejects a second worktree-scoped member naming both roles', () => {
    const members: readonly TeamMember[] = [
      member('architect'),
      member('executor'),
      member('builder'),
    ];

    expect(() => {
      requireSingleWorktreeMember(members, SCOPES);
    }).toThrow(TeamDefinitionError);
    expect(() => {
      requireSingleWorktreeMember(members, SCOPES);
    }).toThrow(
      /members\[2\] "builder" declares the "worktree" write scope, but "executor" already holds it/,
    );
  });
});
