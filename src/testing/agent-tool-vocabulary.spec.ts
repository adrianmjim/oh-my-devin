import { describe, expect, it } from 'vitest';
import { AGENT_TOOL_VOCABULARY } from './agent-tool-vocabulary';

describe('AGENT_TOOL_VOCABULARY', () => {
  it('covers the toolset the canonical trio is granted', () => {
    expect(AGENT_TOOL_VOCABULARY).toEqual(
      expect.arrayContaining(['read', 'grep', 'create', 'edit', 'exec']),
    );
  });

  it('covers the tools a role body must not reach for when ungranted', () => {
    expect(AGENT_TOOL_VOCABULARY).toEqual(
      expect.arrayContaining([
        'bash',
        'shell',
        'browser',
        'search',
        'webfetch',
      ]),
    );
  });

  it('names each tool once', () => {
    expect(new Set(AGENT_TOOL_VOCABULARY).size).toBe(
      AGENT_TOOL_VOCABULARY.length,
    );
  });
});
