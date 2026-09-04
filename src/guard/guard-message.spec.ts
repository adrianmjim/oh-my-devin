import { describe, expect, it } from 'vitest';
import type { LayerCatalogEntry } from '../layer/layer-catalog-entry';
import { LAYER_COMPONENT_CATALOG } from '../layer/layer-component-catalog';
import { guardMessage } from './guard-message';

const SHIPPED_ROLES: readonly string[] = LAYER_COMPONENT_CATALOG.filter(
  (entry: LayerCatalogEntry): boolean => entry.regionId.startsWith('role-'),
).map((entry: LayerCatalogEntry): string =>
  entry.regionId.replace(/^role-/, ''),
);

describe('guardMessage', () => {
  it('explains the write contract and names the target', () => {
    const message: string = guardMessage('src/index.ts');

    expect(message).toContain('src/index.ts');
    expect(message.toLowerCase()).toContain('write contract');
  });

  it('refers to the delegation skill and the role listing', () => {
    const message: string = guardMessage('src/index.ts');

    expect(message).toContain('omd-delegate');
    expect(message).toContain('omd roles list');
  });

  it('names the layer paths the session may write directly', () => {
    const message: string = guardMessage('src/index.ts');

    expect(message).toContain('.omd');
    expect(message).toContain('.devin');
    expect(message).toContain('AGENTS.md');
  });

  it('names no concrete role', () => {
    const message: string = guardMessage('src/index.ts').toLowerCase();

    expect(SHIPPED_ROLES.length).toBeGreaterThan(0);
    for (const role of SHIPPED_ROLES) {
      expect(message).not.toContain(role);
    }
  });

  it('carries no mapping from file kinds to roles', () => {
    const message: string = guardMessage('src/index.ts').toLowerCase();

    expect(message).not.toContain('.ts →');
    expect(message).not.toContain('use the');
  });
});
