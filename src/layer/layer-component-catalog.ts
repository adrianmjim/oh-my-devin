import { join } from 'node:path';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
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
} from '../setup/setup-templates';
import type { LayerCatalogEntry } from './layer-catalog-entry';

const MODE_SKILL_ENTRIES: readonly LayerCatalogEntry[] = MODE_CATALOG.map(
  (skill: ModeSkill): LayerCatalogEntry => ({
    regionId: `skill-${skill.name}`,
    component: 'skills',
    content: skill.content,
    setup: {
      relativePath: join('.devin', 'skills', skill.name, 'SKILL.md'),
      strategy: 'unit',
    },
    plugin: { relativePath: join('skills', skill.name, 'SKILL.md') },
  }),
);

export const LAYER_COMPONENT_CATALOG: readonly LayerCatalogEntry[] = [
  {
    regionId: 'rules',
    component: 'rules',
    content: RULES_FILE,
    userContent: USER_RULES_FILE,
    setup: { relativePath: 'AGENTS.md', strategy: 'container' },
    plugin: { relativePath: 'AGENTS.md' },
  },
  {
    regionId: 'role-architect',
    component: 'roles',
    content: ARCHITECT_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'architect', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-architecture',
    component: 'roles',
    content: ARCHITECT_ROLE_SCHEMA,
    setup: {
      relativePath: join('.devin', 'schemas', 'architecture.schema.json'),
      strategy: 'json-document',
    },
  },
  {
    regionId: 'role-executor',
    component: 'roles',
    content: EXECUTOR_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'executor', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-evidence',
    component: 'roles',
    content: EXECUTOR_ROLE_SCHEMA,
    setup: {
      relativePath: join('.devin', 'schemas', 'evidence.schema.json'),
      strategy: 'json-document',
    },
  },
  {
    regionId: 'role-reviewer',
    component: 'roles',
    content: REVIEWER_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'reviewer', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-review',
    component: 'roles',
    content: REVIEWER_ROLE_SCHEMA,
    setup: {
      relativePath: join('.devin', 'schemas', 'review.schema.json'),
      strategy: 'json-document',
    },
  },
  {
    regionId: 'skill-omd-delegate',
    component: 'skills',
    content: DELEGATION_SKILL,
    setup: {
      relativePath: join('.devin', 'skills', 'omd-delegate', 'SKILL.md'),
      strategy: 'unit',
    },
    plugin: { relativePath: join('skills', 'omd-delegate', 'SKILL.md') },
  },
  {
    regionId: 'skill-omd-install',
    component: 'skills',
    content: INSTALL_SKILL,
    setup: {
      relativePath: join('.devin', 'skills', 'omd-install', 'SKILL.md'),
      strategy: 'unit',
    },
    plugin: { relativePath: join('skills', 'omd-install', 'SKILL.md') },
  },
  ...MODE_SKILL_ENTRIES,
  {
    regionId: 'hook-script',
    component: 'hooks',
    content: HOOK_SCRIPT,
    setup: {
      relativePath: join('.devin', 'hooks', 'omd-mode.mjs'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'team-default',
    component: 'teams',
    content: DEFAULT_TEAM_YAML,
    setup: {
      relativePath: join('.devin', 'teams', 'default.yaml'),
      strategy: 'unit',
    },
  },
];
