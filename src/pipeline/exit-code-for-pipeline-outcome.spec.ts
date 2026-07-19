import { describe, expect, it } from 'vitest';
import { exitCodeForPipelineOutcome } from './exit-code-for-pipeline-outcome';

describe('exitCodeForPipelineOutcome', () => {
  it('maps a succeeded pipeline to exit code 0', () => {
    expect(exitCodeForPipelineOutcome('succeeded')).toBe(0);
  });

  it('maps a halted pipeline to a non-zero exit code', () => {
    expect(exitCodeForPipelineOutcome('halted')).not.toBe(0);
  });
});
