import { describe, expect, it } from 'vitest';
import { AGENT_TOOL_VOCABULARY } from '../testing/agent-tool-vocabulary';
import { isWriteTool } from './is-write-tool';
import { WRITE_TOOLS } from './write-tools';

describe('isWriteTool', () => {
  it('accepts every member of the write family', () => {
    for (const tool of WRITE_TOOLS) {
      expect(isWriteTool(tool)).toBe(true);
    }
  });

  it('accepts the family however the engine capitalizes it', () => {
    expect(isWriteTool('Edit')).toBe(true);
    expect(isWriteTool('WRITE')).toBe(true);
  });

  it('rejects the shell and read-only tools the engine ships', () => {
    const others: readonly string[] = AGENT_TOOL_VOCABULARY.filter(
      (tool: string): boolean => !WRITE_TOOLS.includes(tool),
    );

    expect(others.length).toBeGreaterThan(0);
    for (const tool of others) {
      expect(isWriteTool(tool)).toBe(false);
    }
  });

  it('rejects an unnamed tool', () => {
    expect(isWriteTool(null)).toBe(false);
    expect(isWriteTool('')).toBe(false);
  });
});
