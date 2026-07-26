import { describe, expect, it } from 'vitest';
import { MIN_NODE_MAJOR } from './min-node-major';
import { MIN_NODE_MINOR } from './min-node-minor';
import { nodeRuntimeCheck } from './node-runtime-check';

describe('nodeRuntimeCheck', () => {
  it('passes at the minimum version', () => {
    expect(
      nodeRuntimeCheck(`${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}.0`).outcome,
    ).toBe('pass');
  });

  it('passes above the minimum major', () => {
    expect(nodeRuntimeCheck(`${MIN_NODE_MAJOR + 1}.0.0`).outcome).toBe('pass');
  });

  it('fails below the minimum minor', () => {
    expect(
      nodeRuntimeCheck(`${MIN_NODE_MAJOR}.${MIN_NODE_MINOR - 1}.0`).outcome,
    ).toBe('fail');
  });

  it('fails below the minimum major', () => {
    expect(nodeRuntimeCheck(`${MIN_NODE_MAJOR - 1}.99.0`).outcome).toBe('fail');
  });

  it('fails on an unreadable version', () => {
    expect(nodeRuntimeCheck('unknown').outcome).toBe('fail');
  });

  it('treats a missing minor as zero', () => {
    expect(nodeRuntimeCheck(`${MIN_NODE_MAJOR + 1}`).outcome).toBe('pass');
  });
});
