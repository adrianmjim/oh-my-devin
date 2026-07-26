import { describe, expect, it } from 'vitest';
import type { CouncilSeat } from '../council/council-seat';
import { composeProposerPrompt } from './compose-proposer-prompt';
import type { ProposerRequest } from './proposer-request';
import type { TypedPosition } from './typed-position';

const SEAT: CouncilSeat = {
  id: 'proposer',
  role: 'architect',
  lens: 'design',
  proposer: true,
  contrarian: false,
  model: null,
};

function request(overrides: Partial<ProposerRequest>): ProposerRequest {
  return {
    seat: SEAT,
    question: 'should we ship?',
    currentProposal: null,
    blocking: [],
    clarificationQuestions: [],
    ...overrides,
  };
}

const OBJECTION: TypedPosition = {
  seat: 'security',
  lens: 'auth',
  kind: 'objection',
  domain: 'auth',
  severity: 'high',
  concern: 'token leak',
  assumptions: [],
  reconsiderWhen: [],
};

describe('composeProposerPrompt', () => {
  it('asks for a draft when there is no proposal yet', () => {
    const prompt: string = composeProposerPrompt(request({}));

    expect(prompt).toContain('## Question\nshould we ship?');
    expect(prompt).toContain('Draft a proposal');
  });

  it('asks for answers, not a revision, when clarifications are pending', () => {
    const prompt: string = composeProposerPrompt(
      request({ currentProposal: 'ship it', clarificationQuestions: ['why?'] }),
    );

    expect(prompt).toContain('## Clarification questions\n- why?');
    expect(prompt).toContain('restate the proposal unchanged');
    expect(prompt).not.toContain('## Blocking objections');
  });

  it('asks for a revision resolving the blocking objections', () => {
    const prompt: string = composeProposerPrompt(
      request({ currentProposal: 'ship it', blocking: [OBJECTION] }),
    );

    expect(prompt).toContain(
      '## Blocking objections\n- [high] auth: token leak',
    );
    expect(prompt).toContain('Revise the proposal');
  });
});
