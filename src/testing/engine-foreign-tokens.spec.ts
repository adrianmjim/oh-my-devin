import { describe, expect, it } from 'vitest';
import { ENGINE_FOREIGN_TOKENS } from './engine-foreign-tokens';

describe('ENGINE_FOREIGN_TOKENS', () => {
  it('bans the Claude Code tool idioms with no Devin equivalent', () => {
    expect(ENGINE_FOREIGN_TOKENS).toContain('TodoWrite');
    expect(ENGINE_FOREIGN_TOKENS).toContain('lsp_diagnostics');
    expect(ENGINE_FOREIGN_TOKENS).toContain('ast_grep');
  });

  it('bans delegating away from the role that was launched', () => {
    expect(ENGINE_FOREIGN_TOKENS).toContain('Task tool');
    expect(ENGINE_FOREIGN_TOKENS).toContain('subagent');
  });

  it('bans state paths owned by another layer', () => {
    expect(ENGINE_FOREIGN_TOKENS).toContain('.omc/');
  });
});
