import { describe, expect, it } from 'vitest';
import { pipelineNow } from './pipeline-now';
import type { RunPipelineOptions } from './run-pipeline-options';

function options(clock?: () => number): RunPipelineOptions {
  return {
    team: { name: 't', members: [], workflow: [] },
    task: 'build it',
    runStage: () => Promise.reject(new Error('unused')),
    gate: () => Promise.resolve('none'),
    ...(clock === undefined ? {} : { clock }),
  };
}

describe('pipelineNow', () => {
  it('reads the clock the run was given', () => {
    expect(pipelineNow(options((): number => 42))).toBe(42);
  });

  it('is zero when the run carries no clock', () => {
    expect(pipelineNow(options())).toBe(0);
  });
});
