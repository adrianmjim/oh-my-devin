import { join } from 'node:path';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
import type { LayerFile } from './layer-file';
import {
  ARCHITECT_ROLE_AGENT_MD,
  ARCHITECT_ROLE_SCHEMA,
  DEFAULT_TEAM_YAML,
  DELEGATION_SKILL,
  EXECUTOR_ROLE_AGENT_MD,
  EXECUTOR_ROLE_SCHEMA,
  HOOK_SCRIPT,
  INSTALL_SKILL,
  REVIEWER_ROLE_AGENT_MD,
  REVIEWER_ROLE_SCHEMA,
  RULES_FILE,
  USER_RULES_FILE,
} from './setup-templates';

const MODE_SKILL_FILES: readonly LayerFile[] = MODE_CATALOG.map(
  (skill: ModeSkill): LayerFile => ({
    relativePath: join('.devin', 'skills', skill.name, 'SKILL.md'),
    content: skill.content,
    component: 'skills',
    strategy: 'unit',
    regionId: `skill-${skill.name}`,
  }),
);

export const LAYER_FILES: readonly LayerFile[] = [
  {
    relativePath: 'AGENTS.md',
    content: RULES_FILE,
    userContent: USER_RULES_FILE,
    component: 'rules',
    strategy: 'container',
    regionId: 'rules',
  },
  {
    relativePath: join('.devin', 'agents', 'architect', 'AGENT.md'),
    content: ARCHITECT_ROLE_AGENT_MD,
    component: 'roles',
    strategy: 'unit',
    regionId: 'role-architect',
  },
  {
    relativePath: join('.devin', 'schemas', 'architecture.schema.json'),
    content: ARCHITECT_ROLE_SCHEMA,
    component: 'roles',
    strategy: 'json-document',
    regionId: 'schema-architecture',
  },
  {
    relativePath: join('.devin', 'agents', 'executor', 'AGENT.md'),
    content: EXECUTOR_ROLE_AGENT_MD,
    component: 'roles',
    strategy: 'unit',
    regionId: 'role-executor',
  },
  {
    relativePath: join('.devin', 'schemas', 'evidence.schema.json'),
    content: EXECUTOR_ROLE_SCHEMA,
    component: 'roles',
    strategy: 'json-document',
    regionId: 'schema-evidence',
  },
  {
    relativePath: join('.devin', 'agents', 'reviewer', 'AGENT.md'),
    content: REVIEWER_ROLE_AGENT_MD,
    component: 'roles',
    strategy: 'unit',
    regionId: 'role-reviewer',
  },
  {
    relativePath: join('.devin', 'schemas', 'review.schema.json'),
    content: REVIEWER_ROLE_SCHEMA,
    component: 'roles',
    strategy: 'json-document',
    regionId: 'schema-review',
  },
  {
    relativePath: join('.devin', 'skills', 'omd-delegate', 'SKILL.md'),
    content: DELEGATION_SKILL,
    component: 'skills',
    strategy: 'unit',
    regionId: 'skill-omd-delegate',
  },
  {
    relativePath: join('.devin', 'skills', 'omd-install', 'SKILL.md'),
    content: INSTALL_SKILL,
    component: 'skills',
    strategy: 'unit',
    regionId: 'skill-omd-install',
  },
  ...MODE_SKILL_FILES,
  {
    relativePath: join('.devin', 'hooks', 'omd-mode.mjs'),
    content: HOOK_SCRIPT,
    component: 'hooks',
    strategy: 'unit',
    regionId: 'hook-script',
  },
  {
    relativePath: join('.devin', 'teams', 'default.yaml'),
    content: DEFAULT_TEAM_YAML,
    component: 'teams',
    strategy: 'unit',
    regionId: 'team-default',
  },
];
