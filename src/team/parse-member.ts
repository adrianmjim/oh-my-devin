import { isTeamStrategy } from './is-team-strategy';
import { requireTeamString } from './require-team-string';
import { TeamDefinitionError } from './team-definition-error';
import type { TeamMember } from './team-member';
import type { TeamStrategy } from './team-strategy';

export function parseMember(
  entry: unknown,
  index: number,
  knownRoles: readonly string[],
): TeamMember {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new TeamDefinitionError(`member ${index} must be a mapping`);
  }
  const fields: Record<string, unknown> = entry as Record<string, unknown>;
  const role: string = requireTeamString(
    fields['role'],
    `members[${index}].role`,
  );
  if (!knownRoles.includes(role)) {
    throw new TeamDefinitionError(
      `member "${role}" names a role with no definition`,
    );
  }
  const count: unknown = fields['count'];
  if (typeof count !== 'number' || !Number.isInteger(count) || count <= 0) {
    throw new TeamDefinitionError(
      `member "${role}" must declare a positive integer count`,
    );
  }

  const strategyValue: unknown = fields['strategy'];
  let strategy: TeamStrategy | null;
  if (strategyValue === undefined || strategyValue === null) {
    if (count > 1) {
      throw new TeamDefinitionError(
        `multi-instance member "${role}" must declare a strategy`,
      );
    }
    strategy = null;
  } else if (isTeamStrategy(strategyValue)) {
    strategy = strategyValue;
  } else {
    throw new TeamDefinitionError(
      `member "${role}" has an invalid strategy: ${JSON.stringify(strategyValue)}`,
    );
  }

  return { role, count, strategy };
}
