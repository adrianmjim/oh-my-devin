import { describe, expect, it } from 'vitest';
import { RULES_FILE_NAME } from './rules-file-name';

describe('RULES_FILE_NAME', () => {
  it('names the rules class file', () => {
    expect(RULES_FILE_NAME).toBe('rules.json');
  });
});
