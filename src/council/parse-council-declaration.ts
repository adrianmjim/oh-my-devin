import { parse as parseYaml } from 'yaml';
import type { AuthorityPolicy } from './authority-policy';
import type { CouncilDeclaration } from './council-declaration';
import { CouncilDeclarationError } from './council-declaration-error';
import type { CouncilSeat } from './council-seat';
import type { DeliberationTunables } from './deliberation-tunables';
import { parseAuthority } from './parse-authority';
import { parseDeliberationTunables } from './parse-deliberation-tunables';
import { parseSeats } from './parse-seats';
import { requireCouncilString } from './require-council-string';
import type { RoleWriteScopes } from './role-write-scopes';

export function parseCouncilDeclaration(
  yaml: string,
  roleScopes: RoleWriteScopes,
): CouncilDeclaration {
  const parsed: unknown = parseYaml(yaml);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new CouncilDeclarationError('council declaration must be a mapping');
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;

  const name: string = requireCouncilString(fields['name'], 'name');
  const seats: readonly CouncilSeat[] = parseSeats(fields['seats'], roleScopes);
  const tunables: DeliberationTunables = parseDeliberationTunables(
    fields['deliberation'],
  );
  const authority: AuthorityPolicy = parseAuthority(fields['authority']);

  return { name, seats, tunables, authority };
}
