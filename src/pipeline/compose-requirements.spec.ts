import { describe, expect, it } from 'vitest';
import { composeRequirements } from './compose-requirements';
import type { RunPipelineOptions } from './run-pipeline-options';

function options(requirements?: string): RunPipelineOptions {
  return {
    team: { name: 't', members: [], workflow: [] },
    task: 'build it',
    runStage: () => Promise.reject(new Error('unused')),
    gate: () => Promise.resolve('none'),
    ...(requirements === undefined ? {} : { requirements }),
  };
}

describe('composeRequirements', () => {
  it('is the task alone when the run carries no requirements', () => {
    expect(composeRequirements(options())).toBe('build it');
  });

  it('appends the requirements below the task', () => {
    expect(composeRequirements(options('must be fast'))).toBe(
      'build it\n\nmust be fast',
    );
  });
});
