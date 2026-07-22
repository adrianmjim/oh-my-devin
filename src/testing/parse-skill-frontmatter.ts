import { parse as parseYaml } from 'yaml';
import type { SkillFrontmatter } from './skill-frontmatter';
import { SkillFrontmatterError } from './skill-frontmatter-error';
import type { SkillPermissions } from './skill-permissions';

const FRONTMATTER_PATTERN: RegExp =
  /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new SkillFrontmatterError(`"${field}" must be a non-empty string`);
  }
  return value;
}

function optionalStringArray(value: unknown, field: string): readonly string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new SkillFrontmatterError(`"${field}" must be a list of strings`);
  }
  return value.map((item: unknown, index: number): string => {
    if (typeof item !== 'string') {
      throw new SkillFrontmatterError(`"${field}[${index}]" must be a string`);
    }
    return item;
  });
}

function parsePermissions(value: unknown): SkillPermissions | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new SkillFrontmatterError('"permissions" must be a mapping');
  }
  const perms: Record<string, unknown> = value as Record<string, unknown>;
  return { allow: optionalStringArray(perms['allow'], 'permissions.allow') };
}

export function parseSkillFrontmatter(skill: string): SkillFrontmatter {
  const match: RegExpExecArray | null = FRONTMATTER_PATTERN.exec(
    skill.trimStart(),
  );
  if (match === null) {
    throw new SkillFrontmatterError('skill has no YAML frontmatter');
  }

  const frontmatterText: string = match[1] ?? '';
  const parsed: unknown = parseYaml(frontmatterText);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new SkillFrontmatterError('skill frontmatter must be a mapping');
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;

  return {
    name: requireString(fields['name'], 'name'),
    description: requireString(fields['description'], 'description'),
    triggers: optionalStringArray(fields['triggers'], 'triggers'),
    allowedTools: optionalStringArray(fields['allowed-tools'], 'allowed-tools'),
    permissions: parsePermissions(fields['permissions']),
  };
}
