import { describe, expect, it } from 'vitest';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { LayerCatalogEntry } from './layer-catalog-entry';
import { MODE_SKILL_ENTRIES } from './mode-skill-entries';

describe('MODE_SKILL_ENTRIES', () => {
  it('declares one catalog entry per mode skill', () => {
    expect(MODE_SKILL_ENTRIES).toHaveLength(MODE_CATALOG.length);
  });

  it('installs every entry as a skill unit file', () => {
    for (const entry of MODE_SKILL_ENTRIES) {
      expect(entry.component).toBe('skills');
      expect(entry.setup.strategy).toBe('unit');
      expect(entry.setup.relativePath).toContain('SKILL.md');
    }
  });

  it('names each region after the skill it carries', () => {
    const first: LayerCatalogEntry | undefined = MODE_SKILL_ENTRIES[0];

    expect(first?.regionId.startsWith('skill-')).toBe(true);
  });
});
