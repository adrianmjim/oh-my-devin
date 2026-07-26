import { describe, expect, it } from 'vitest';
import { MAX_SUMMARY_LENGTH } from './max-summary-length';
import { summarizePromptBody } from './summarize-prompt-body';

describe('summarizePromptBody', () => {
  it('summarizes with the first non-empty line', () => {
    expect(summarizePromptBody('\n\n  Do the work.\nThen stop.')).toBe(
      'Do the work.',
    );
  });

  it('is empty for a body with no content', () => {
    expect(summarizePromptBody('\n  \n')).toBe('');
  });

  it('elides a line longer than the summary bound', () => {
    const summary: string = summarizePromptBody('x'.repeat(200));

    expect(summary).toHaveLength(MAX_SUMMARY_LENGTH);
    expect(summary.endsWith('...')).toBe(true);
  });
});
