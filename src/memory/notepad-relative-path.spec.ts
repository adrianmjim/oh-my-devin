import { describe, expect, it } from 'vitest';
import { NOTEPAD_RELATIVE_PATH } from './notepad-relative-path';

describe('NOTEPAD_RELATIVE_PATH', () => {
  it('locates the notepad from the project root with posix separators', () => {
    expect(NOTEPAD_RELATIVE_PATH).toBe('.omd/memory/notepad.json');
  });
});
