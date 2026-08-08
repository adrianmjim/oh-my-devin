import { describe, expect, it } from 'vitest';
import { EMPTY_MEMORY_DELIVERY } from '../memory/empty-memory-delivery';
import type { MemoryDelivery } from '../memory/memory-delivery';
import type { RoleDefinition } from '../role/role-definition';
import { buildContractualPreamble } from './build-contractual-preamble';

const REMEMBERED: MemoryDelivery = {
  profile: {
    stack: ['node'],
    layout: ['src'],
    entryCommands: ['pnpm run test'],
    derivedAt: 5,
  },
  notepad: [
    {
      kind: 'priority',
      text: 'deploys need the staging gate',
      hash: 'abc',
      recordedAt: 5,
    },
  ],
};

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
  memorySelection: [],
  promptBody: 'You are the reviewer.',
};

describe('buildContractualPreamble', () => {
  it('names the declared artifact and schema', () => {
    const preamble: string = buildContractualPreamble(
      ROLE,
      EMPTY_MEMORY_DELIVERY,
    );
    expect(preamble).toContain('review.json');
    expect(preamble).toContain('schemas/review.schema.json');
  });

  it('states the single-artifact write confinement', () => {
    const preamble: string = buildContractualPreamble(
      ROLE,
      EMPTY_MEMORY_DELIVERY,
    );
    expect(preamble.toLowerCase()).toContain('no file other than');
  });

  it('bounds a worktree-scoped role to its working directory', () => {
    const preamble: string = buildContractualPreamble(
      {
        ...ROLE,
        name: 'executor',
        outputArtifact: 'evidence.json',
        writeScope: 'worktree',
      },
      EMPTY_MEMORY_DELIVERY,
    );

    expect(preamble.toLowerCase()).toContain('working directory');
    expect(preamble.toLowerCase()).toContain('nothing outside it');
    expect(preamble.toLowerCase()).not.toContain('no file other than');
  });

  it('still names the artifact, the schema, and the end of the turn', () => {
    const preamble: string = buildContractualPreamble(
      {
        ...ROLE,
        name: 'executor',
        outputArtifact: 'evidence.json',
        writeScope: 'worktree',
      },
      EMPTY_MEMORY_DELIVERY,
    );

    expect(preamble).toContain('evidence.json');
    expect(preamble).toContain('schemas/review.schema.json');
    expect(preamble.toLowerCase()).toContain('end your turn');
  });

  it('carries no memory content for a role that declared none', () => {
    const preamble: string = buildContractualPreamble(
      ROLE,
      EMPTY_MEMORY_DELIVERY,
    );

    expect(preamble).not.toContain('Project memory');
    expect(preamble).not.toContain('staging gate');
  });

  it('carries the delivered memory content alongside the contract', () => {
    const preamble: string = buildContractualPreamble(ROLE, REMEMBERED);

    expect(preamble).toContain('review.json');
    expect(preamble).toContain('Project memory');
    expect(preamble).toContain('deploys need the staging gate');
    expect(preamble).toContain('pnpm run test');
  });

  it('carries exactly the delivered classes and no other', () => {
    const preamble: string = buildContractualPreamble(ROLE, {
      ...REMEMBERED,
      profile: null,
    });

    expect(preamble).toContain('deploys need the staging gate');
    expect(preamble).not.toContain('pnpm run test');
  });
});
