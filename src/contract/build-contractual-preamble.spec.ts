import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import { buildContractualPreamble } from './build-contractual-preamble';

const ROLE: RoleDefinition = {
  name: 'reviewer',
  engine: 'devin',
  agentType: null,
  model: null,
  tools: [],
  permissions: { allow: [], deny: [], ask: [] },
  outputArtifact: 'review.json',
  outputSchema: 'schemas/review.schema.json',
  maxTurns: 8,
  contextPolicy: 'isolated',
  wallTimeMs: null,
  promptBody: 'You are the reviewer.',
};

describe('buildContractualPreamble', () => {
  it('names the declared artifact and schema', () => {
    const preamble: string = buildContractualPreamble(ROLE);
    expect(preamble).toContain('review.json');
    expect(preamble).toContain('schemas/review.schema.json');
  });

  it('states the single-artifact write confinement', () => {
    const preamble: string = buildContractualPreamble(ROLE);
    expect(preamble.toLowerCase()).toContain('no file other than');
  });
});
