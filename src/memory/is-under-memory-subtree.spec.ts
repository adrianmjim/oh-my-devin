import { describe, expect, it } from 'vitest';
import { isUnderMemorySubtree } from './is-under-memory-subtree';

describe('isUnderMemorySubtree', () => {
  it('recognizes a path inside the durable subtree', () => {
    expect(isUnderMemorySubtree('.omd/memory/notepad.json')).toBe(true);
    expect(isUnderMemorySubtree('.omd/memory/nested/thing.json')).toBe(true);
    expect(isUnderMemorySubtree('./.omd/memory/notepad.json')).toBe(true);
    expect(isUnderMemorySubtree('.omd\\memory\\notepad.json')).toBe(true);
  });

  it('recognizes the subtree root itself', () => {
    expect(isUnderMemorySubtree('.omd/memory')).toBe(true);
  });

  it('leaves the rest of the transient .omd state alone', () => {
    expect(isUnderMemorySubtree('.omd/runs/run-1/events.jsonl')).toBe(false);
    expect(isUnderMemorySubtree('.omd/mode.json')).toBe(false);
    expect(isUnderMemorySubtree('.omd')).toBe(false);
  });

  it('leaves ordinary repository paths alone', () => {
    expect(isUnderMemorySubtree('review.json')).toBe(false);
    expect(isUnderMemorySubtree('src/memory/notepad.json')).toBe(false);
    expect(isUnderMemorySubtree('memory/notepad.json')).toBe(false);
  });
});
