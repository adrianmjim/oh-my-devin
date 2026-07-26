import { join } from 'node:path';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
import type { LayerCatalogEntry } from './layer-catalog-entry';

export const MODE_SKILL_ENTRIES: readonly LayerCatalogEntry[] =
  MODE_CATALOG.map((skill: ModeSkill): LayerCatalogEntry => ({
    regionId: `skill-${skill.name}`,
    component: 'skills',
    content: skill.content,
    setup: {
      relativePath: join('.devin', 'skills', skill.name, 'SKILL.md'),
      strategy: 'unit',
    },
    plugin: { relativePath: join('skills', skill.name, 'SKILL.md') },
  }));
