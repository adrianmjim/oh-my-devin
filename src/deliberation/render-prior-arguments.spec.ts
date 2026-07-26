import { describe, expect, it } from 'vitest';
import type { AnonymizedArgument } from './anonymized-argument';
import { renderPriorArguments } from './render-prior-arguments';

const ARGUMENT: AnonymizedArgument = {
  kind: 'objection',
  severity: 'high',
  domain: 'auth',
  concern: 'token leak',
};

describe('renderPriorArguments', () => {
  it('renders each argument with its kind, severity, and domain', () => {
    expect(renderPriorArguments([ARGUMENT])).toBe(
      '- [objection/high] auth: token leak',
    );
  });

  it('is empty for no prior arguments', () => {
    expect(renderPriorArguments([])).toBe('');
  });
});
