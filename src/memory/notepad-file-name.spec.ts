import { describe, expect, it } from 'vitest';
import { NOTEPAD_FILE_NAME } from './notepad-file-name';

describe('NOTEPAD_FILE_NAME', () => {
  it('names the notepad class file', () => {
    expect(NOTEPAD_FILE_NAME).toBe('notepad.json');
  });
});
