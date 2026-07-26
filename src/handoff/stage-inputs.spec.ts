import { describe, expect, it } from 'vitest';
import { INCOMING_ARTIFACTS } from './incoming-artifacts';
import { stageInputs } from './stage-inputs';

describe('stageInputs', () => {
  it('names the designated inputs of a stage', () => {
    expect(stageInputs('reviewer')).toEqual([
      'requirements',
      'diff',
      'evidence.json',
    ]);
  });

  it('agrees with the incoming artifact catalog', () => {
    expect(stageInputs('architect')).toBe(INCOMING_ARTIFACTS.architect);
  });
});
