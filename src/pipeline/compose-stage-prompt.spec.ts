import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import { composeStagePrompt } from './compose-stage-prompt';
import type { StageRequest } from './stage-request';

function request(
  inputs: readonly (readonly [HandoffArtifactName, string])[],
): StageRequest {
  return {
    stage: 'executor',
    reworkFrom: null,
    inputs: new Map<HandoffArtifactName, string>(inputs),
  };
}

function reworkRequest(
  inputs: readonly (readonly [HandoffArtifactName, string])[],
): StageRequest {
  return {
    stage: 'executor',
    reworkFrom: 'reviewer',
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

  it('leaves a non-rework prompt byte-identical to an unframed composition', () => {
    const inputs: readonly (readonly [HandoffArtifactName, string])[] = [
      ['requirements', 'build it'],
      ['architecture.json', 'plan'],
    ];
    expect(composeStagePrompt(request(inputs))).toBe(
      'build it\n\n## architecture.json\nplan',
    );
  });

  it('states that a prior attempt was rejected on a rework invocation', () => {
    const prompt: string = composeStagePrompt(
      reworkRequest([
        ['requirements', 'build it'],
        ['architecture.json', 'plan'],
        ['review.json', '{"verdict":"request_changes"}'],
        ['diff', 'DIFF'],
      ]),
    );
    expect(prompt).toContain('rejected');
  });

  it('names the conveyed findings as the reason and the work to be done', () => {
    const prompt: string = composeStagePrompt(
      reworkRequest([
        ['requirements', 'build it'],
        ['review.json', '{"verdict":"request_changes"}'],
        ['diff', 'DIFF'],
      ]),
    );
    expect(prompt).toMatch(/review\.json/);
    expect(prompt).toMatch(/finding/i);
    expect(prompt).toMatch(/resolve|work to be done/i);
  });

  it('states that the architecture still governs the approach', () => {
    const prompt: string = composeStagePrompt(
      reworkRequest([
        ['requirements', 'build it'],
        ['architecture.json', 'plan'],
        ['review.json', '{"verdict":"request_changes"}'],
        ['diff', 'DIFF'],
      ]),
    );
    expect(prompt).toMatch(/architecture\.json still governs/i);
  });

  it('still leads with the requirements and carries every conveyed artifact', () => {
    const prompt: string = composeStagePrompt(
      reworkRequest([
        ['requirements', 'build it'],
        ['architecture.json', 'plan'],
        ['review.json', 'FINDINGS'],
        ['diff', 'DIFF'],
      ]),
    );
    expect(prompt.startsWith('build it')).toBe(true);
    expect(prompt).toContain('## architecture.json\nplan');
    expect(prompt).toContain('## review.json\nFINDINGS');
    expect(prompt).toContain('## diff\nDIFF');
  });
});
