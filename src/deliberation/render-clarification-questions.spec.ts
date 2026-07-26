import { describe, expect, it } from 'vitest';
import { renderClarificationQuestions } from './render-clarification-questions';

describe('renderClarificationQuestions', () => {
  it('renders one bullet per question', () => {
    expect(renderClarificationQuestions(['why?', 'when?'])).toBe(
      '- why?\n- when?',
    );
  });

  it('is empty for no questions', () => {
    expect(renderClarificationQuestions([])).toBe('');
  });
});
