import { describe, expect, it } from 'vitest';
import { reworkStageEntry } from './rework-stage-entry';
import type { StageEntry } from './stage-entry';

describe('reworkStageEntry', () => {
  it('describes re-entry from a predecessor by a non-passed outcome', () => {
    const entry: StageEntry = reworkStageEntry('executor', 'reviewer');
    expect(entry.stage).toBe('executor');
    expect(entry.reworkFrom).toBe('reviewer');
  });

  it('names the rejecting stage, whichever stage rejected', () => {
    const entry: StageEntry = reworkStageEntry('executor', 'architect');
    expect(entry.reworkFrom).toBe('architect');
  });
});
