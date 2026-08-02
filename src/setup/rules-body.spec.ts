import { describe, expect, it } from 'vitest';
import { RULES_BODY } from './rules-body';

describe('RULES_BODY', () => {
  it('describes both lanes of the layer', () => {
    const body: string = RULES_BODY.join('\n');

    expect(body).toContain('Conversational lane');
    expect(body).toContain('Contractual lane');
  });

  it('lists the three installed roles', () => {
    const body: string = RULES_BODY.join('\n');

    expect(body).toContain('`architect`');
    expect(body).toContain('`executor`');
    expect(body).toContain('`reviewer`');
  });

  it('names the delegation skill', () => {
    expect(RULES_BODY.join('\n')).toContain('omd-delegate');
  });

  it('instructs surfacing the attention-worthy states of the ambient summary', () => {
    const body: string = RULES_BODY.join('\n');

    expect(body).toContain('pending gate');
    expect(body).toContain('stalled');
    expect(body).toContain('terminal outcome');
  });

  it('instructs staying silent about unremarkable progress', () => {
    expect(RULES_BODY.join('\n')).toContain('unremarkable progress');
  });

  it('is a list of lines carrying no line separators of its own', () => {
    for (const line of RULES_BODY) {
      expect(line).not.toContain('\n');
    }
  });
});
