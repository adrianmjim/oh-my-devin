import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
import type { LayerComponent } from './layer-component';
import { ALL_LAYER_COMPONENTS } from './layer-component';
import type { SetupResult } from './setup-result';
import {
  ARCHITECT_ROLE_AGENT_MD,
  ARCHITECT_ROLE_SCHEMA,
  DEFAULT_TEAM_YAML,
  DELEGATION_SKILL,
  EXECUTOR_ROLE_AGENT_MD,
  EXECUTOR_ROLE_SCHEMA,
  HOOKS_MAP,
  HOOK_SCRIPT,
  INSTALL_SKILL,
  REVIEWER_ROLE_AGENT_MD,
  REVIEWER_ROLE_SCHEMA,
  RULES_FILE,
} from './setup-templates';

interface LayerFile {
  readonly relativePath: string;
  readonly content: string;
  readonly component: LayerComponent;
}

const MODE_SKILL_FILES: readonly LayerFile[] = MODE_CATALOG.map(
  (skill: ModeSkill): LayerFile => ({
    relativePath: join('.devin', 'skills', skill.name, 'SKILL.md'),
    content: skill.content,
    component: 'skills',
  }),
);

const LAYER_FILES: readonly LayerFile[] = [
  { relativePath: 'AGENTS.md', content: RULES_FILE, component: 'rules' },
  {
    relativePath: join('.devin', 'agents', 'architect', 'AGENT.md'),
    content: ARCHITECT_ROLE_AGENT_MD,
    component: 'roles',
  },
  {
    relativePath: join('.devin', 'schemas', 'architecture.schema.json'),
    content: ARCHITECT_ROLE_SCHEMA,
    component: 'roles',
  },
  {
    relativePath: join('.devin', 'agents', 'executor', 'AGENT.md'),
    content: EXECUTOR_ROLE_AGENT_MD,
    component: 'roles',
  },
  {
    relativePath: join('.devin', 'schemas', 'evidence.schema.json'),
    content: EXECUTOR_ROLE_SCHEMA,
    component: 'roles',
  },
  {
    relativePath: join('.devin', 'agents', 'reviewer', 'AGENT.md'),
    content: REVIEWER_ROLE_AGENT_MD,
    component: 'roles',
  },
  {
    relativePath: join('.devin', 'schemas', 'review.schema.json'),
    content: REVIEWER_ROLE_SCHEMA,
    component: 'roles',
  },
  {
    relativePath: join('.devin', 'skills', 'omd-delegate', 'SKILL.md'),
    content: DELEGATION_SKILL,
    component: 'skills',
  },
  {
    relativePath: join('.devin', 'skills', 'omd-install', 'SKILL.md'),
    content: INSTALL_SKILL,
    component: 'skills',
  },
  ...MODE_SKILL_FILES,
  {
    relativePath: join('.devin', 'hooks.v1.json'),
    content: HOOKS_MAP,
    component: 'hooks',
  },
  {
    relativePath: join('.devin', 'hooks', 'omd-mode.mjs'),
    content: HOOK_SCRIPT,
    component: 'hooks',
  },
  {
    relativePath: join('.devin', 'teams', 'default.yaml'),
    content: DEFAULT_TEAM_YAML,
    component: 'teams',
  },
];

export async function setupLayer(
  targetDir: string,
  scope?: readonly LayerComponent[],
): Promise<SetupResult> {
  const selected: ReadonlySet<LayerComponent> = new Set(
    scope ?? ALL_LAYER_COMPONENTS,
  );
  const filesToWrite: readonly LayerFile[] = LAYER_FILES.filter(
    (file: LayerFile): boolean => selected.has(file.component),
  );
  const writtenPaths: string[] = [];
  for (const file of filesToWrite) {
    const absolutePath: string = join(targetDir, file.relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, 'utf8');
    writtenPaths.push(file.relativePath);
  }
  return { writtenPaths };
}
