import { describe, expect, it } from 'vitest';
import { TERMINAL_NODE } from './terminal-node';

describe('TERMINAL_NODE', () => {
  it('names the workflow node that ends a pipeline', () => {
    expect(TERMINAL_NODE).toBe('done');
  });
});
