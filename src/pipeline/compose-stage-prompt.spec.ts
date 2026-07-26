import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import { composeStagePrompt } from './compose-stage-prompt';
import type { StageRequest } from './stage-request';

function request(
  inputs: readonly (readonly [HandoffArtifactName, string])[],
): StageRequest {
  return {
    stage: 'executor',
    inputs: new Map<HandoffArtifactName, string>(inputs),
  };
}

describe('composeStagePrompt', () => {
  it('leads with the requirements, unheaded', () => {
    expect(composeStagePrompt(request([['requirements', 'build it']]))).toBe(
      'build it',
    );
  });

  it('heads every other input with its artifact name', () => {
    expect(
      composeStagePrompt(request([['architecture.json', '{"a":1}']])),
    ).toBe('## architecture.json\n{"a":1}');
  });

  it('keeps the requirements first whatever the input order', () => {
    expect(
      composeStagePrompt(
        request([
          ['architecture.json', 'plan'],
          ['requirements', 'build it'],
        ]),
      ),
    ).toBe('build it\n\n## architecture.json\nplan');
  });

  it('is empty when the stage receives nothing', () => {
    expect(composeStagePrompt(request([]))).toBe('');
  });
});
