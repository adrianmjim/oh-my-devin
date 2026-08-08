import { describe, expect, it } from 'vitest';
import { EMPTY_MEMORY_DELIVERY } from './empty-memory-delivery';
import type { MemoryDelivery } from './memory-delivery';
import { renderMemoryDelivery } from './render-memory-delivery';

const FULL: MemoryDelivery = {
  profile: {
    stack: ['node', 'typescript'],
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
    { kind: 'manual', text: 'the gate is manual', hash: 'def', recordedAt: 6 },
  ],
  knowledge: [
    {
      text: 'the release gate is manual',
      triggers: ['release'],
      hash: 'ghi',
      recordedAt: 7,
    },
  ],
};

describe('renderMemoryDelivery', () => {
  it('renders nothing for an empty delivery', () => {
    expect(renderMemoryDelivery(EMPTY_MEMORY_DELIVERY)).toBe('');
  });

  it('renders the notepad entries with their kind', () => {
    const text: string = renderMemoryDelivery({
      ...EMPTY_MEMORY_DELIVERY,
      notepad: FULL.notepad,
    });

    expect(text).toContain('deploys need the staging gate');
    expect(text).toContain('priority');
    expect(text).toContain('the gate is manual');
  });

  it('renders no profile content when the profile was not delivered', () => {
    const text: string = renderMemoryDelivery({
      ...EMPTY_MEMORY_DELIVERY,
      notepad: FULL.notepad,
    });

    expect(text).not.toContain('typescript');
    expect(text).not.toContain('pnpm run test');
  });

  it('renders the profile snapshot fields', () => {
    const text: string = renderMemoryDelivery({
      profile: FULL.profile,
      notepad: [],
      knowledge: [],
    });

    expect(text).toContain('typescript');
    expect(text).toContain('src');
    expect(text).toContain('pnpm run test');
  });

  it('names the content as the project’s own memory', () => {
    expect(renderMemoryDelivery(FULL)).toContain('Project memory');
  });

  it('renders the same delivery identically every time', () => {
    expect(renderMemoryDelivery(FULL)).toBe(renderMemoryDelivery(FULL));
  });
});
