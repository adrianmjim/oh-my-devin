import { describe, expect, it } from 'vitest';
import { KNOWLEDGE_FILE_NAME } from './knowledge-file-name';

describe('KNOWLEDGE_FILE_NAME', () => {
  it('names the knowledge class file', () => {
    expect(KNOWLEDGE_FILE_NAME).toBe('knowledge.json');
  });
});
