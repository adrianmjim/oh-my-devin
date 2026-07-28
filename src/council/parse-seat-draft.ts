import { CouncilDeclarationError } from './council-declaration-error';
import { parseSeatFlag } from './parse-seat-flag';
import { parseSeatModel } from './parse-seat-model';
import { requireCouncilString } from './require-council-string';
import type { RoleWriteScopes } from './role-write-scopes';
import type { SeatDraft } from './seat-draft';

export function parseSeatDraft(
  entry: unknown,
  index: number,
  roleScopes: RoleWriteScopes,
): SeatDraft {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new CouncilDeclarationError(`seat ${index} must be a mapping`);
  }
  const fields: Record<string, unknown> = entry as Record<string, unknown>;
  const role: string = requireCouncilString(
    fields['role'],
    `seats[${index}].role`,
  );
  if (!roleScopes.has(role)) {
    throw new CouncilDeclarationError(
      `seat "${role}" names a role with no definition`,
    );
  }
  if (roleScopes.get(role) === 'worktree') {
    throw new CouncilDeclarationError(
      `seats[${index}] "${role}" declares the "worktree" write scope, which a council seat cannot hold: seat worktrees are torn down with no diff capture`,
    );
  }
  const lens: string = requireCouncilString(
    fields['lens'],
    `seats[${index}].lens`,
  );
  const proposer: boolean = parseSeatFlag(fields['proposer'], role, 'proposer');
  const contrarian: boolean = parseSeatFlag(
    fields['contrarian'],
    role,
    'contrarian',
  );
  const model: string | null = parseSeatModel(fields['model'], role);

  return { role, lens, proposer, contrarian, model };
}
