import { CouncilDeclarationError } from './council-declaration-error';
import { parseSeatFlag } from './parse-seat-flag';
import { parseSeatModel } from './parse-seat-model';
import { requireCouncilString } from './require-council-string';
import type { SeatDraft } from './seat-draft';

export function parseSeatDraft(
  entry: unknown,
  index: number,
  knownRoles: readonly string[],
): SeatDraft {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new CouncilDeclarationError(`seat ${index} must be a mapping`);
  }
  const fields: Record<string, unknown> = entry as Record<string, unknown>;
  const role: string = requireCouncilString(
    fields['role'],
    `seats[${index}].role`,
  );
  if (!knownRoles.includes(role)) {
    throw new CouncilDeclarationError(
      `seat "${role}" names a role with no definition`,
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
