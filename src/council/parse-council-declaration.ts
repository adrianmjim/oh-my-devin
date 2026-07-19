import { parse as parseYaml } from 'yaml';
import type { AuthorityPolicy } from './authority-policy';
import { isAuthorityPolicy } from './authority-policy';
import type { CouncilDeclaration } from './council-declaration';
import { CouncilDeclarationError } from './council-declaration-error';
import type { CouncilSeat } from './council-seat';
import type { DeliberationTunables } from './deliberation-tunables';
import type { Severity } from './severity';
import { isSeverity } from './severity';

const DEFAULT_THRESHOLD: Severity = 'high';
const DEFAULT_AUTHORITY: AuthorityPolicy = 'human';

export function parseCouncilDeclaration(
  yaml: string,
  knownRoles: readonly string[],
): CouncilDeclaration {
  const parsed: unknown = parseYaml(yaml);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new CouncilDeclarationError('council declaration must be a mapping');
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;

  const name: string = requireString(fields['name'], 'name');
  const seats: readonly CouncilSeat[] = parseSeats(fields['seats'], knownRoles);
  const tunables: DeliberationTunables = parseTunables(fields['deliberation']);
  const authority: AuthorityPolicy = parseAuthority(fields['authority']);

  return { name, seats, tunables, authority };
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new CouncilDeclarationError(`"${field}" must be a non-empty string`);
  }
  return value;
}

interface SeatDraft {
  readonly role: string;
  readonly lens: string;
  readonly proposer: boolean;
  readonly contrarian: boolean;
  readonly model: string | null;
}

function parseSeats(
  value: unknown,
  knownRoles: readonly string[],
): readonly CouncilSeat[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CouncilDeclarationError('"seats" must be a non-empty list');
  }
  const drafts: readonly SeatDraft[] = value.map(
    (entry: unknown, index: number): SeatDraft =>
      parseSeat(entry, index, knownRoles),
  );
  return assignSeatIds(drafts);
}

function assignSeatIds(drafts: readonly SeatDraft[]): readonly CouncilSeat[] {
  const totals: Map<string, number> = new Map<string, number>();
  for (const draft of drafts) {
    totals.set(draft.role, (totals.get(draft.role) ?? 0) + 1);
  }
  const occurrences: Map<string, number> = new Map<string, number>();
  const seats: readonly CouncilSeat[] = drafts.map(
    (draft: SeatDraft): CouncilSeat => {
      const total: number = totals.get(draft.role) ?? 0;
      const occurrence: number = (occurrences.get(draft.role) ?? 0) + 1;
      occurrences.set(draft.role, occurrence);
      const id: string = total > 1 ? `${draft.role}-${occurrence}` : draft.role;
      return { id, ...draft };
    },
  );
  const seen: Set<string> = new Set<string>();
  for (const seat of seats) {
    if (seen.has(seat.id)) {
      throw new CouncilDeclarationError(
        `seat id "${seat.id}" is claimed by more than one seat`,
      );
    }
    seen.add(seat.id);
  }
  return seats;
}

function parseSeat(
  entry: unknown,
  index: number,
  knownRoles: readonly string[],
): SeatDraft {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new CouncilDeclarationError(`seat ${index} must be a mapping`);
  }
  const fields: Record<string, unknown> = entry as Record<string, unknown>;
  const role: string = requireString(fields['role'], `seats[${index}].role`);
  if (!knownRoles.includes(role)) {
    throw new CouncilDeclarationError(
      `seat "${role}" names a role with no definition`,
    );
  }
  const lens: string = requireString(fields['lens'], `seats[${index}].lens`);
  const proposer: boolean = parseFlag(fields['proposer'], role, 'proposer');
  const contrarian: boolean = parseFlag(
    fields['contrarian'],
    role,
    'contrarian',
  );
  const model: string | null = parseModel(fields['model'], role);

  return { role, lens, proposer, contrarian, model };
}

function parseFlag(value: unknown, role: string, field: string): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value !== 'boolean') {
    throw new CouncilDeclarationError(
      `seat "${role}" field "${field}" must be a boolean`,
    );
  }
  return value;
}

function parseModel(value: unknown, role: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string' || value.length === 0) {
    throw new CouncilDeclarationError(
      `seat "${role}" field "model" must be a non-empty string`,
    );
  }
  return value;
}

function parseTunables(value: unknown): DeliberationTunables {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new CouncilDeclarationError('"deliberation" must be a mapping');
  }
  const fields: Record<string, unknown> = value as Record<string, unknown>;

  const roundsCapValue: unknown = fields['rounds_cap'];
  if (
    typeof roundsCapValue !== 'number' ||
    !Number.isInteger(roundsCapValue) ||
    roundsCapValue <= 0
  ) {
    throw new CouncilDeclarationError(
      '"rounds_cap" must be a positive integer',
    );
  }

  const thresholdValue: unknown = fields['blocking_threshold'];
  let blockingThreshold: Severity;
  if (thresholdValue === undefined || thresholdValue === null) {
    blockingThreshold = DEFAULT_THRESHOLD;
  } else if (isSeverity(thresholdValue)) {
    blockingThreshold = thresholdValue;
  } else {
    throw new CouncilDeclarationError(
      `"blocking_threshold" must be one of low, medium, high, critical`,
    );
  }

  const wallTimeValue: unknown = fields['wall_time_ms'];
  let wallTimeMs: number | null;
  if (wallTimeValue === undefined || wallTimeValue === null) {
    wallTimeMs = null;
  } else if (typeof wallTimeValue === 'number' && wallTimeValue > 0) {
    wallTimeMs = wallTimeValue;
  } else {
    throw new CouncilDeclarationError(
      '"wall_time_ms" must be a positive number',
    );
  }

  return { roundsCap: roundsCapValue, blockingThreshold, wallTimeMs };
}

function parseAuthority(value: unknown): AuthorityPolicy {
  if (value === undefined || value === null) {
    return DEFAULT_AUTHORITY;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new CouncilDeclarationError('"authority" must be a mapping');
  }
  const fields: Record<string, unknown> = value as Record<string, unknown>;
  const onConsent: unknown = fields['on_consent'];
  if (onConsent === undefined || onConsent === null) {
    return DEFAULT_AUTHORITY;
  }
  if (!isAuthorityPolicy(onConsent)) {
    throw new CouncilDeclarationError(
      '"on_consent" must be either human or proceed',
    );
  }
  return onConsent;
}
