import { describe, expect, it } from 'vitest';
import { baseStageEntry } from './base-stage-entry';
import type { StageEntry } from './stage-entry';

describe('baseStageEntry', () => {
  it('describes the entry stage, which has no predecessor', () => {
    const entry: StageEntry = baseStageEntry('architect');
    expect(entry.stage).toBe('architect');
    expect(entry.reworkFrom).toBeNull();
  });

  it('describes a stage entered from a predecessor by approval', () => {
    const entry: StageEntry = baseStageEntry('executor');
    expect(entry.stage).toBe('executor');
    expect(entry.reworkFrom).toBeNull();
  });
});
