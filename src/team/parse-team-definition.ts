import { parse as parseYaml } from 'yaml';
import type { OutcomeTransition } from './outcome-transition';
import type { TeamDefinition } from './team-definition';
import { TeamDefinitionError } from './team-definition-error';
import type { TeamMember } from './team-member';
import type { TeamStrategy } from './team-strategy';
import { isTeamStrategy } from './team-strategy';
import type { TeamTransition } from './team-transition';

const TERMINAL_NODE: string = 'done';
const OUTCOME_KEY: RegExp = /^on_(.+)$/;

export function parseTeamDefinition(
  yaml: string,
  knownRoles: readonly string[],
): TeamDefinition {
  const parsed: unknown = parseYaml(yaml);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new TeamDefinitionError('team declaration must be a mapping');
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;

  const name: string = requireString(fields['name'], 'name');
  const members: readonly TeamMember[] = parseMembers(
    fields['members'],
    knownRoles,
  );
  const memberRoles: ReadonlySet<string> = new Set(
    members.map((member: TeamMember): string => member.role),
  );
  const validNodes: ReadonlySet<string> = new Set([
    ...memberRoles,
    TERMINAL_NODE,
  ]);
  const workflow: readonly TeamTransition[] = parseWorkflow(
    fields['workflow'],
    memberRoles,
    validNodes,
  );

  return { name, members, workflow };
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TeamDefinitionError(`"${field}" must be a non-empty string`);
  }
  return value;
}

function parseMembers(
  value: unknown,
  knownRoles: readonly string[],
): readonly TeamMember[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TeamDefinitionError('"members" must be a non-empty list');
  }
  return value.map((entry: unknown, index: number): TeamMember =>
    parseMember(entry, index, knownRoles),
  );
}

function parseMember(
  entry: unknown,
  index: number,
  knownRoles: readonly string[],
): TeamMember {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new TeamDefinitionError(`member ${index} must be a mapping`);
  }
  const fields: Record<string, unknown> = entry as Record<string, unknown>;
  const role: string = requireString(fields['role'], `members[${index}].role`);
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

function parseWorkflow(
  value: unknown,
  memberRoles: ReadonlySet<string>,
  validNodes: ReadonlySet<string>,
): readonly TeamTransition[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TeamDefinitionError('"workflow" must be a mapping');
  }
  const map: Record<string, unknown> = value as Record<string, unknown>;
  const transitions: TeamTransition[] = [];
  for (const from of Object.keys(map)) {
    if (!memberRoles.has(from)) {
      throw new TeamDefinitionError(
        `workflow stage "${from}" is not a declared member`,
      );
    }
    transitions.push(parseTransition(from, map[from], validNodes));
  }
  return transitions;
}

function parseTransition(
  from: string,
  value: unknown,
  validNodes: ReadonlySet<string>,
): TeamTransition {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TeamDefinitionError(`workflow stage "${from}" must be a mapping`);
  }
  const spec: Record<string, unknown> = value as Record<string, unknown>;
  let then: string | null = null;
  const outcomes: OutcomeTransition[] = [];
  for (const key of Object.keys(spec)) {
    const target: unknown = spec[key];
    if (typeof target !== 'string') {
      throw new TeamDefinitionError(
        `workflow stage "${from}" transition "${key}" must name a successor`,
      );
    }
    if (!validNodes.has(target)) {
      throw new TeamDefinitionError(
        `workflow stage "${from}" transitions to unknown successor "${target}"`,
      );
    }
    if (key === 'then') {
      then = target;
      continue;
    }
    const match: RegExpExecArray | null = OUTCOME_KEY.exec(key);
    if (match === null) {
      throw new TeamDefinitionError(
        `workflow stage "${from}" has an unrecognized transition key "${key}"`,
      );
    }
    outcomes.push({ outcome: match[1] ?? '', to: target });
  }
  return { from, then, outcomes };
}
