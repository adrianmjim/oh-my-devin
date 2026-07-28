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
  writeScope: 'artifact',
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

  it('bounds a worktree-scoped role to its working directory', () => {
    const preamble: string = buildContractualPreamble({
      ...ROLE,
      name: 'executor',
      outputArtifact: 'evidence.json',
      writeScope: 'worktree',
    });

    expect(preamble.toLowerCase()).toContain('working directory');
    expect(preamble.toLowerCase()).toContain('nothing outside it');
    expect(preamble.toLowerCase()).not.toContain('no file other than');
  });

  it('still names the artifact, the schema, and the end of the turn', () => {
    const preamble: string = buildContractualPreamble({
      ...ROLE,
      name: 'executor',
      outputArtifact: 'evidence.json',
      writeScope: 'worktree',
    });

    expect(preamble).toContain('evidence.json');
    expect(preamble).toContain('schemas/review.schema.json');
    expect(preamble.toLowerCase()).toContain('end your turn');
  });
});
