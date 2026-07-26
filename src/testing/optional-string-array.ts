import { SkillFrontmatterError } from './skill-frontmatter-error';

export function optionalStringArray(
  value: unknown,
  field: string,
): readonly string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new SkillFrontmatterError(`"${field}" must be a list of strings`);
  }
  return value.map((item: unknown, index: number): string => {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new SkillFrontmatterError(
        `"${field}[${index}]" must be a non-empty string`,
      );
    }
    return item;
  });
}
