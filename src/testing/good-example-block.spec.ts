import { describe, expect, it } from 'vitest';
import { goodExampleBlock } from './good-example-block';

describe('goodExampleBlock', () => {
  it('joins the indented block that follows the good label', () => {
    const body: string = [
      'Bad — nope:',
      '',
      '    { "a": 1 }',
      '',
      'Good — yes:',
      '',
      '    { "b": 2,',
      '      "c": 3 }',
      '',
      '## Next section',
    ].join('\n');

    expect(goodExampleBlock(body)).toBe('{ "b": 2, "c": 3 }');
  });

  it('stops at the first unindented line after the block', () => {
    const body: string = ['Good — yes:', '', '    { "b": 2 }', 'prose'].join(
      '\n',
    );

    expect(goodExampleBlock(body)).toBe('{ "b": 2 }');
  });

  it('returns nothing when the body carries no good example', () => {
    expect(goodExampleBlock('A body with no examples at all.')).toBe('');
  });
});
