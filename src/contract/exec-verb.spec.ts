import { describe, expect, it } from 'vitest';
import { EXEC_VERB } from './exec-verb';

describe('EXEC_VERB', () => {
  it('names the permission verb that grants command execution', () => {
    expect(EXEC_VERB).toBe('Exec');
  });
});
