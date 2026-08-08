import { describe, expect, it } from 'vitest';
import { splitSentences } from './split-sentences';

describe('splitSentences', () => {
  it('splits text into the sentences a moment can be read from', () => {
    expect(
      splitSentences('Always run the linter. Then push to main.'),
    ).toEqual(['Always run the linter', 'Then push to main']);
  });

  it('splits on newlines as well as terminators', () => {
    expect(splitSentences('first line\nsecond line')).toEqual([
      'first line',
      'second line',
    ]);
  });

  it('drops empty fragments', () => {
    expect(splitSentences('  ...  \n\n  ')).toEqual([]);
  });
});
