import { describe, expect, it } from 'vitest';
import { SYNTHESIS_FALLBACK } from './synthesis-fallback';

describe('SYNTHESIS_FALLBACK', () => {
  it('launches the default team when none is named', () => {
    expect(SYNTHESIS_FALLBACK.join('\n')).toContain('omd team run "<task>"');
  });

  it('discovers the installed roles before composing a team', () => {
    expect(SYNTHESIS_FALLBACK.join('\n')).toContain('omd roles list --json');
  });

  it('forbids inventing a role or overwriting a declaration', () => {
    const text: string = SYNTHESIS_FALLBACK.join('\n');

    expect(text).toContain('never invent a');
    expect(text).toContain('never overwrite an existing');
  });
});
