import { describe, expect, it } from 'vitest';
import { WRITE_TOOLS } from './write-tools';

describe('WRITE_TOOLS', () => {
  it('names the write and edit family the guard intercepts', () => {
    expect(WRITE_TOOLS).toEqual(['create', 'edit', 'write']);
  });

  it('names no shell or read-only tool', () => {
    for (const tool of ['exec', 'bash', 'shell', 'read', 'grep', 'search']) {
      expect(WRITE_TOOLS).not.toContain(tool);
    }
  });
});
