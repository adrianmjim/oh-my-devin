import { describe, expect, it } from 'vitest';
import type { RunId } from './run-id';
import { generateRunId } from './generate-run-id';

describe('generateRunId', () => {
  it('returns a non-empty string', () => {
    const id: RunId = generateRunId();

    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates identities that are unique across generations', () => {
    const count: number = 1000;
    const ids: Set<RunId> = new Set<RunId>();
    for (let index: number = 0; index < count; index += 1) {
      ids.add(generateRunId());
    }

    expect(ids.size).toBe(count);
  });

  it('is opaque — carries no role or task semantics', () => {
    const id: RunId = generateRunId();

    expect(id.toLowerCase()).not.toContain('reviewer');
    expect(id.toLowerCase()).not.toContain('task');
    expect(id).toMatch(/^[0-9a-f-]+$/);
  });

  it('serializes as a stable string that round-trips through JSON', () => {
    const id: RunId = generateRunId();

    const roundTripped: RunId = JSON.parse(JSON.stringify(id)) as RunId;

    expect(roundTripped).toBe(id);
  });
});
