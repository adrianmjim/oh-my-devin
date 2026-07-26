import { describe, expect, it } from 'vitest';
import type { AnonymizedArgument } from './anonymized-argument';
import { composeSummaryPrompt } from './compose-summary-prompt';

const ARGUMENT: AnonymizedArgument = {
  kind: 'objection',
  severity: 'high',
  domain: 'auth',
  concern: 'token leak',
};

describe('composeSummaryPrompt', () => {
  it('lists each argument with its kind, severity, and domain', () => {
    expect(composeSummaryPrompt([ARGUMENT])).toContain(
      '- [objection/high] auth: token leak',
    );
  });

  it('demands a neutral summary that takes no side', () => {
    const prompt: string = composeSummaryPrompt([ARGUMENT]);

    expect(prompt).toContain('neutral prose summary');
    expect(prompt).toContain('Do not take a side');
  });

  it('never asks who made an argument', () => {
    expect(composeSummaryPrompt([ARGUMENT])).toContain(
      'do not speculate about who made them',
    );
  });
});
