import { describe, expect, it } from 'vitest';
import { DeliberationError } from './deliberation-error';
import { parseProposerResult } from './parse-proposer-result';

describe('parseProposerResult', () => {
  it('parses the proposal and its clarifications', () => {
    expect(
      parseProposerResult(
        'proposer',
        '{"proposal":"ship it","clarifications":[{"question":"why?","answer":"safe"}]}',
      ),
    ).toEqual({
      proposal: 'ship it',
      clarifications: [{ question: 'why?', answer: 'safe' }],
    });
  });

  it('defaults the clarifications to none', () => {
    expect(
      parseProposerResult('proposer', '{"proposal":"ship it"}').clarifications,
    ).toEqual([]);
  });

  it('refuses invalid JSON, naming the seat', () => {
    expect(() => parseProposerResult('proposer', 'nope')).toThrow(
      DeliberationError,
    );
    expect(() => parseProposerResult('proposer', 'nope')).toThrow(/proposer/);
  });

  it('refuses a payload that is not a JSON object', () => {
    expect(() => parseProposerResult('proposer', '[]')).toThrow(
      DeliberationError,
    );
  });

  it('refuses a missing or empty proposal', () => {
    expect(() => parseProposerResult('proposer', '{}')).toThrow(/proposal/);
    expect(() => parseProposerResult('proposer', '{"proposal":""}')).toThrow(
      /proposal/,
    );
  });
});
