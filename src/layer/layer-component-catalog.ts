import { join } from 'node:path';
import { ANALYST_ROLE_AGENT_MD } from '../setup/analyst-role-agent-md';
import { ANALYST_ROLE_SCHEMA } from '../setup/analyst-role-schema';
import { ARCHITECT_ROLE_AGENT_MD } from '../setup/architect-role-agent-md';
import { ARCHITECT_ROLE_SCHEMA } from '../setup/architect-role-schema';
import { CRITIC_ROLE_AGENT_MD } from '../setup/critic-role-agent-md';
import { CRITIC_ROLE_SCHEMA } from '../setup/critic-role-schema';
import { DEBUGGER_ROLE_AGENT_MD } from '../setup/debugger-role-agent-md';
import { DEBUGGER_ROLE_SCHEMA } from '../setup/debugger-role-schema';
import { DEFAULT_TEAM_YAML } from '../setup/default-team-yaml';
import { DELEGATION_SKILL } from '../setup/delegation-skill';
import { DOCUMENT_SPECIALIST_ROLE_AGENT_MD } from '../setup/document-specialist-role-agent-md';
import { DOCUMENT_SPECIALIST_ROLE_SCHEMA } from '../setup/document-specialist-role-schema';
import { EXECUTOR_ROLE_AGENT_MD } from '../setup/executor-role-agent-md';
import { EXECUTOR_ROLE_SCHEMA } from '../setup/executor-role-schema';
import { EXPLORE_ROLE_AGENT_MD } from '../setup/explore-role-agent-md';
import { EXPLORE_ROLE_SCHEMA } from '../setup/explore-role-schema';
import { HOOK_SCRIPT } from '../setup/hook-script';
import { INSTALL_SKILL } from '../setup/install-skill';
import { REVIEWER_ROLE_AGENT_MD } from '../setup/reviewer-role-agent-md';
import { REVIEWER_ROLE_SCHEMA } from '../setup/reviewer-role-schema';
import { RULES_FILE } from '../setup/rules-file';
import { SECURITY_REVIEWER_ROLE_AGENT_MD } from '../setup/security-reviewer-role-agent-md';
import { SECURITY_REVIEWER_ROLE_SCHEMA } from '../setup/security-reviewer-role-schema';
import { USER_RULES_FILE } from '../setup/user-rules-file';
import type { LayerCatalogEntry } from './layer-catalog-entry';
import { MODE_SKILL_ENTRIES } from './mode-skill-entries';

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
    regionId: 'role-critic',
    component: 'roles',
    content: CRITIC_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'critic', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-critique',
    component: 'roles',
    content: CRITIC_ROLE_SCHEMA,
    setup: {
      relativePath: join('.devin', 'schemas', 'critique.schema.json'),
      strategy: 'json-document',
    },
  },
  {
    regionId: 'role-analyst',
    component: 'roles',
    content: ANALYST_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'analyst', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-requirements-analysis',
    component: 'roles',
    content: ANALYST_ROLE_SCHEMA,
    setup: {
      relativePath: join(
        '.devin',
        'schemas',
        'requirements-analysis.schema.json',
      ),
      strategy: 'json-document',
    },
  },
  {
    regionId: 'role-security-reviewer',
    component: 'roles',
    content: SECURITY_REVIEWER_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'security-reviewer', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-security-review',
    component: 'roles',
    content: SECURITY_REVIEWER_ROLE_SCHEMA,
    setup: {
      relativePath: join('.devin', 'schemas', 'security-review.schema.json'),
      strategy: 'json-document',
    },
  },
  {
    regionId: 'role-debugger',
    component: 'roles',
    content: DEBUGGER_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'debugger', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-diagnosis',
    component: 'roles',
    content: DEBUGGER_ROLE_SCHEMA,
    setup: {
      relativePath: join('.devin', 'schemas', 'diagnosis.schema.json'),
      strategy: 'json-document',
    },
  },
  {
    regionId: 'role-explore',
    component: 'roles',
    content: EXPLORE_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'explore', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-findings-map',
    component: 'roles',
    content: EXPLORE_ROLE_SCHEMA,
    setup: {
      relativePath: join('.devin', 'schemas', 'findings-map.schema.json'),
      strategy: 'json-document',
    },
  },
  {
    regionId: 'role-document-specialist',
    component: 'roles',
    content: DOCUMENT_SPECIALIST_ROLE_AGENT_MD,
    setup: {
      relativePath: join('.devin', 'agents', 'document-specialist', 'AGENT.md'),
      strategy: 'unit',
    },
  },
  {
    regionId: 'schema-research-brief',
    component: 'roles',
    content: DOCUMENT_SPECIALIST_ROLE_SCHEMA,
    setup: {
      relativePath: join('.devin', 'schemas', 'research-brief.schema.json'),
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
