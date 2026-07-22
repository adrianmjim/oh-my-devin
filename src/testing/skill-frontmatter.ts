import type { SkillPermissions } from './skill-permissions';

export interface SkillFrontmatter {
  readonly name: string;
  readonly description: string;
  readonly triggers: readonly string[];
  readonly allowedTools: readonly string[];
  readonly permissions: SkillPermissions | null;
}
