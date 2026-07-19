import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
import { DELEGATION_SKILL, RULES_FILE } from '../setup/setup-templates';
import type { PluginBundleResult } from './plugin-bundle-result';

interface BundleFile {
  readonly relativePath: string;
  readonly content: string;
}

const MODE_SKILL_FILES: readonly BundleFile[] = MODE_CATALOG.map(
  (skill: ModeSkill): BundleFile => ({
    relativePath: join('skills', skill.name, 'SKILL.md'),
    content: skill.content,
  }),
);

const BUNDLE_FILES: readonly BundleFile[] = [
  { relativePath: 'AGENTS.md', content: RULES_FILE },
  {
    relativePath: join('skills', 'omd-delegate', 'SKILL.md'),
    content: DELEGATION_SKILL,
  },
  ...MODE_SKILL_FILES,
];

export async function buildPluginBundle(
  outDir: string,
): Promise<PluginBundleResult> {
  const writtenPaths: string[] = [];
  for (const file of BUNDLE_FILES) {
    const absolutePath: string = join(outDir, file.relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, 'utf8');
    writtenPaths.push(file.relativePath);
  }
  return { writtenPaths };
}
