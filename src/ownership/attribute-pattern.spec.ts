import { describe, expect, it } from 'vitest';
import { ATTRIBUTE_PATTERN } from './attribute-pattern';

describe('ATTRIBUTE_PATTERN', () => {
  it('matches every key=value pair of a marker line', () => {
    expect(
      [...'id=rules version=1.2.3'.matchAll(ATTRIBUTE_PATTERN)].map(
        (match: RegExpMatchArray): readonly string[] => [
          match[1] ?? '',
          match[2] ?? '',
        ],
      ),
    ).toEqual([
      ['id', 'rules'],
      ['version', '1.2.3'],
    ]);
  });

  it('stops a value at the first space', () => {
    const match: RegExpExecArray | null = new RegExp(
      ATTRIBUTE_PATTERN.source,
    ).exec('id=rules and more');

    expect(match?.[2]).toBe('rules');
  });

  it('scans globally so it can be reused across a line', () => {
    expect(ATTRIBUTE_PATTERN.flags).toContain('g');
  });
});
