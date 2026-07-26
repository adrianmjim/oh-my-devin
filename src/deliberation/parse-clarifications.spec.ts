import { describe, expect, it } from 'vitest';
import { DeliberationError } from './deliberation-error';
import { parseClarifications } from './parse-clarifications';

describe('parseClarifications', () => {
  it('is empty when the proposer declared none', () => {
    expect(parseClarifications('proposer', undefined)).toEqual([]);
  });

  it('parses the question and answer of each entry', () => {
    expect(
      parseClarifications('proposer', [
        { question: 'why?', answer: 'because' },
      ]),
    ).toEqual([{ question: 'why?', answer: 'because' }]);
  });

  it('refuses a value that is not an array', () => {
    expect(() => parseClarifications('proposer', {})).toThrow(
      DeliberationError,
    );
  });

  it('refuses an entry that is not an object', () => {
    expect(() => parseClarifications('proposer', ['x'])).toThrow(
      DeliberationError,
    );
  });

  it('refuses an entry without string question and answer', () => {
    expect(() =>
      parseClarifications('proposer', [{ question: 'why?' }]),
    ).toThrow(/question/);
  });
});
