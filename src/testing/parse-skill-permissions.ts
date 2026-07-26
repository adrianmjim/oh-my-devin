import { optionalStringArray } from './optional-string-array';
import { SkillFrontmatterError } from './skill-frontmatter-error';
import type { SkillPermissions } from './skill-permissions';

export function parseSkillPermissions(value: unknown): SkillPermissions | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new SkillFrontmatterError('"permissions" must be a mapping');
  }
  const perms: Record<string, unknown> = value as Record<string, unknown>;
  return { allow: optionalStringArray(perms['allow'], 'permissions.allow') };
}
