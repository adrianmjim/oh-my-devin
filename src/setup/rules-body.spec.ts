import { describe, expect, it } from 'vitest';
import { RULES_BODY } from './rules-body';

describe('RULES_BODY', () => {
  it('describes both lanes of the layer', () => {
    const body: string = RULES_BODY.join('\n');

    expect(body).toContain('Conversational lane');
    expect(body).toContain('Contractual lane');
  });

  it('lists every installed role', () => {
    const body: string = RULES_BODY.join('\n');

    for (const role of [
      'architect',
      'executor',
      'reviewer',
      'critic',
      'analyst',
      'security-reviewer',
      'debugger',
      'explore',
      'document-specialist',
    ]) {
      expect(body, role).toContain(`\`${role}\``);
    }
  });

  it('names the artifact each installed role writes', () => {
    const body: string = RULES_BODY.join('\n');

    for (const artifact of [
      'architecture.json',
      'evidence.json',
      'review.json',
      'critique.json',
      'requirements-analysis.json',
      'security-review.json',
      'diagnosis.json',
      'findings-map.json',
      'research-brief.json',
    ]) {
      expect(body, artifact).toContain(`\`${artifact}\``);
    }
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
