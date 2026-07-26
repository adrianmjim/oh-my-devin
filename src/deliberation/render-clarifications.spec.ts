import { describe, expect, it } from 'vitest';
import { renderClarifications } from './render-clarifications';

describe('renderClarifications', () => {
  it('renders each question with its answer', () => {
    expect(
      renderClarifications([{ question: 'why?', answer: 'because' }]),
    ).toBe('- Q: why?\n  A: because');
  });

  it('marks an unanswered question', () => {
    expect(renderClarifications([{ question: 'why?', answer: null }])).toBe(
      '- Q: why?\n  A: (unanswered)',
    );
  });

  it('is empty for no clarifications', () => {
    expect(renderClarifications([])).toBe('');
  });
});
