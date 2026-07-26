import { describe, expect, it } from 'vitest';
import { hookRegistryEvents } from './hook-registry-events';

describe('hookRegistryEvents', () => {
  it('treats the whole document as the event map for a document registry', () => {
    const document: Record<string, unknown> = { Stop: [] };

    expect(hookRegistryEvents('document', document)).toBe(document);
  });

  it('reads the hooks key for a config-key registry', () => {
    const events: Record<string, unknown> = { Stop: [] };

    expect(hookRegistryEvents('config-key', { hooks: events })).toBe(events);
  });

  it('is an empty map when the config-key registry has no hooks key yet', () => {
    expect(hookRegistryEvents('config-key', {})).toEqual({});
  });

  it('is null when the hooks key holds no event map', () => {
    expect(hookRegistryEvents('config-key', { hooks: [] })).toBeNull();
    expect(hookRegistryEvents('config-key', { hooks: 'x' })).toBeNull();
  });
});
