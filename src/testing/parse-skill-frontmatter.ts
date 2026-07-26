import { parse as parseYaml } from 'yaml';
import { optionalStringArray } from './optional-string-array';
import { parseSkillPermissions } from './parse-skill-permissions';
import { requireSkillString } from './require-skill-string';
import type { SkillFrontmatter } from './skill-frontmatter';
import { SkillFrontmatterError } from './skill-frontmatter-error';
import { SKILL_FRONTMATTER_PATTERN } from './skill-frontmatter-pattern';

export function parseSkillFrontmatter(skill: string): SkillFrontmatter {
  const match: RegExpExecArray | null = SKILL_FRONTMATTER_PATTERN.exec(
    skill.trimStart(),
  );
  if (match === null) {
    throw new SkillFrontmatterError('skill has no YAML frontmatter');
  }

  const frontmatterText: string = match[1] ?? '';
  let parsed: unknown;
  try {
    parsed = parseYaml(frontmatterText);
  } catch (error) {
    throw new SkillFrontmatterError(
      `skill frontmatter is not valid YAML: ${String(error)}`,
    );
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new SkillFrontmatterError('skill frontmatter must be a mapping');
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;

  return {
    name: requireSkillString(fields['name'], 'name'),
    description: requireSkillString(fields['description'], 'description'),
    triggers: optionalStringArray(fields['triggers'], 'triggers'),
    allowedTools: optionalStringArray(fields['allowed-tools'], 'allowed-tools'),
    permissions: parseSkillPermissions(fields['permissions']),
  };
}
