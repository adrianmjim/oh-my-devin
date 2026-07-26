import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { LayerCatalogEntry } from '../layer/layer-catalog-entry';
import { LAYER_COMPONENT_CATALOG } from '../layer/layer-component-catalog';
import { ALL_LAYER_COMPONENTS } from '../layer/all-layer-components';
import type { LayerComponent } from '../layer/layer-component';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
import { LAYER_FILES } from './layer-files';
import type { LayerFile } from './layer-file';

function byPath(relativePath: string): LayerFile {
  const file: LayerFile | undefined = LAYER_FILES.find(
    (candidate: LayerFile): boolean => candidate.relativePath === relativePath,
  );
  if (file === undefined) {
    throw new Error(`no catalog entry at ${relativePath}`);
  }
  return file;
}

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

  it('declares a merge strategy and a region identity for every target', () => {
    for (const file of LAYER_FILES) {
      expect(file.strategy.length).toBeGreaterThan(0);
      expect(file.regionId.length).toBeGreaterThan(0);
    }
  });

  it('gives every target a region identity of its own', () => {
    const ids: readonly string[] = LAYER_FILES.map(
      (file: LayerFile): string => file.regionId,
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('accumulates the rules file and takes over no other text file', () => {
    expect(byPath('AGENTS.md').strategy).toBe('container');
    expect(
      byPath(join('.devin', 'skills', 'omd-delegate', 'SKILL.md')).strategy,
    ).toBe('unit');
    expect(
      byPath(join('.devin', 'agents', 'architect', 'AGENT.md')).strategy,
    ).toBe('unit');
    expect(byPath(join('.devin', 'teams', 'default.yaml')).strategy).toBe(
      'unit',
    );
    expect(byPath(join('.devin', 'hooks', 'omd-mode.mjs')).strategy).toBe(
      'unit',
    );
  });

  it('merges the role schemas as json documents', () => {
    expect(
      byPath(join('.devin', 'schemas', 'review.schema.json')).strategy,
    ).toBe('json-document');
  });

  it('is the setup projection of the layer component catalog', () => {
    expect(
      LAYER_FILES.map((file: LayerFile): string => file.relativePath),
    ).toEqual(
      LAYER_COMPONENT_CATALOG.map(
        (entry: LayerCatalogEntry): string => entry.setup.relativePath,
      ),
    );
    LAYER_FILES.forEach((file: LayerFile, index: number): void => {
      const entry: LayerCatalogEntry | undefined =
        LAYER_COMPONENT_CATALOG[index];
      if (entry === undefined) {
        throw new Error(`no catalog entry at index ${String(index)}`);
      }
      expect(file.content, entry.regionId).toBe(entry.content);
      expect(file.component, entry.regionId).toBe(entry.component);
      expect(file.strategy, entry.regionId).toBe(entry.setup.strategy);
      expect(file.regionId).toBe(entry.regionId);
      expect(file.userContent, entry.regionId).toBe(entry.userContent);
    });
  });

  it('leaves the hook registry out of the file catalog, since it is claimed', () => {
    const registry: LayerFile | undefined = LAYER_FILES.find(
      (file: LayerFile): boolean =>
        file.relativePath === join('.devin', 'hooks.v1.json'),
    );

    expect(registry).toBeUndefined();
  });
});
