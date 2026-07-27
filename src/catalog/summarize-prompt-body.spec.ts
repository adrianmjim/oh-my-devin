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

  it('skips a section heading and summarizes with the prose beneath it', () => {
    expect(
      summarizePromptBody('## Mission\n\nYou are the architect.\nYou plan.'),
    ).toBe('You are the architect.');
  });

  it('skips a heading of any depth', () => {
    expect(summarizePromptBody('# Role\n\n#### Mission\n\nDo the work.')).toBe(
      'Do the work.',
    );
  });

  it('keeps a line whose hash is not heading markup', () => {
    expect(summarizePromptBody('#not-a-heading is the tag.')).toBe(
      '#not-a-heading is the tag.',
    );
  });

  it('is empty for a body of headings only', () => {
    expect(summarizePromptBody('## Mission\n\n## Boundaries\n')).toBe('');
  });

  it('elides a line longer than the summary bound', () => {
    const summary: string = summarizePromptBody('x'.repeat(200));

    expect(summary).toHaveLength(MAX_SUMMARY_LENGTH);
    expect(summary.endsWith('...')).toBe(true);
  });
});
