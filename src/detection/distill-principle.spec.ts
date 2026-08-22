import { describe, expect, it } from 'vitest';
import { distillPrinciple } from './distill-principle';

describe('distillPrinciple', () => {
  it('states the moment as a reusable principle', () => {
    expect(distillPrinciple('always run the linter before pushing')).toBe(
      'In this project, always run the linter before pushing.',
    );
  });

  it('phrases the principle independently of the conversation', () => {
    const source: string = 'hey, always run the linter before pushing, ok';

    const principle: string = distillPrinciple(source);

    expect(principle).not.toBe(source);
    expect(source).not.toContain(principle);
  });

  it('normalizes conversational lead-ins and trailing punctuation away', () => {
    expect(distillPrinciple('and Always run the linter!!')).toBe(
      'In this project, always run the linter.',
    );
  });
});
