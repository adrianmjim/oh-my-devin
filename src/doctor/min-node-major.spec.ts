import { describe, expect, it } from 'vitest';
import { MIN_NODE_MAJOR } from './min-node-major';

describe('MIN_NODE_MAJOR', () => {
  it('requires a Node major line with the runtime features omd uses', () => {
    expect(MIN_NODE_MAJOR).toBe(22);
  });
});
