import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
import { LAYER_FILES } from './layer-catalog';
import { ALL_LAYER_COMPONENTS } from './layer-component';
import type { LayerComponent } from './layer-component';
import type { LayerFile } from './layer-file';

describe('LAYER_FILES', () => {
  it('yields exactly one skill file per mode skill', () => {
    const modePaths: readonly string[] = MODE_CATALOG.map(
      (skill: ModeSkill): string =>
        join('.devin', 'skills', skill.name, 'SKILL.md'),
    );
    const present: readonly string[] = LAYER_FILES.filter(
      (file: LayerFile): boolean => modePaths.includes(file.relativePath),
    ).map((file: LayerFile): string => file.relativePath);

    expect(present).toHaveLength(MODE_CATALOG.length);
    expect(new Set(present).size).toBe(MODE_CATALOG.length);
  });

  it('declares every mode skill under the skills component', () => {
    const modeNames: readonly string[] = MODE_CATALOG.map(
      (skill: ModeSkill): string => skill.name,
    );
    for (const file of LAYER_FILES) {
      const isModeSkill: boolean = modeNames.some(
        (name: string): boolean =>
          file.relativePath === join('.devin', 'skills', name, 'SKILL.md'),
      );
      if (isModeSkill) {
        expect(file.component).toBe('skills');
      }
    }
  });

  it('covers every layer component', () => {
    const covered: ReadonlySet<LayerComponent> = new Set(
      LAYER_FILES.map((file: LayerFile): LayerComponent => file.component),
    );
    for (const component of ALL_LAYER_COMPONENTS) {
      expect(covered.has(component)).toBe(true);
    }
  });

  it('gives every entry a distinct relative path', () => {
    const paths: readonly string[] = LAYER_FILES.map(
      (file: LayerFile): string => file.relativePath,
    );
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every entry non-empty content', () => {
    for (const file of LAYER_FILES) {
      expect(file.content.length).toBeGreaterThan(0);
    }
  });
});
