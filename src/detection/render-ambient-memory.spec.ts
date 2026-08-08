import { describe, expect, it } from 'vitest';
import type { AmbientMemory } from './ambient-memory';
import { EMPTY_AMBIENT_MEMORY } from './empty-ambient-memory';
import { renderAmbientMemory } from './render-ambient-memory';

const FULL: AmbientMemory = {
  priority: [
    { kind: 'priority', text: 'the gate is manual', hash: 'a', recordedAt: 1 },
  ],
  proposals: [
    {
      principle: 'In this project, always run the linter before pushing.',
      confirmingCommand:
        'omd memory remember "In this project, always run the linter before pushing."',
      score: 0.8,
      expiresAt: 5_000,
      deliveredAt: null,
    },
  ],
  knowledge: [
    {
      text: 'the release gate is manual',
      triggers: ['release'],
      hash: 'b',
      recordedAt: 2,
    },
  ],
  rules: [
    {
      text: 'the data owner reviews migrations',
      hash: 'c',
      stagedAt: 100,
      deliveredAt: null,
    },
  ],
};

describe('renderAmbientMemory', () => {
  it('renders nothing when no class carries content', () => {
    expect(renderAmbientMemory(EMPTY_AMBIENT_MEMORY)).toBe('');
  });

  it('renders each class it was given', () => {
    const text: string = renderAmbientMemory(FULL);

    expect(text).toContain('the gate is manual');
    expect(text).toContain('the release gate is manual');
    expect(text).toContain('the data owner reviews migrations');
  });

  it('renders a proposal with the command that confirms it', () => {
    const text: string = renderAmbientMemory(FULL);

    expect(text).toContain(
      'In this project, always run the linter before pushing.',
    );
    expect(text).toContain('omd memory remember');
  });

  it('renders only the classes that carry content', () => {
    const text: string = renderAmbientMemory({
      ...EMPTY_AMBIENT_MEMORY,
      priority: FULL.priority,
    });

    expect(text).toContain('the gate is manual');
    expect(text).not.toContain('omd memory remember');
    expect(text).not.toContain('the data owner reviews migrations');
  });

  it('carries no trigger term or glob of its own', () => {
    const text: string = renderAmbientMemory(FULL);

    expect(text).not.toContain('triggers');
    expect(text).not.toContain('globs');
  });
});
