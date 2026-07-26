import { TeamDefinitionError } from './team-definition-error';

export function requireTeamString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TeamDefinitionError(`"${field}" must be a non-empty string`);
  }
  return value;
}
