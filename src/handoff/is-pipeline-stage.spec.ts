import { describe, expect, it } from 'vitest';
import { isPipelineStage } from './is-pipeline-stage';

describe('isPipelineStage', () => {
  it('accepts the three MVP-1 pipeline stages', () => {
    expect(isPipelineStage('architect')).toBe(true);
    expect(isPipelineStage('executor')).toBe(true);
    expect(isPipelineStage('reviewer')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isPipelineStage('done')).toBe(false);
    expect(isPipelineStage(null)).toBe(false);
  });
});
