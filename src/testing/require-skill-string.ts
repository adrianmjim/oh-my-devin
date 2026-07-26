import { SkillFrontmatterError } from './skill-frontmatter-error';

export function requireSkillString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new SkillFrontmatterError(`"${field}" must be a non-empty string`);
  }
  return value;
}
