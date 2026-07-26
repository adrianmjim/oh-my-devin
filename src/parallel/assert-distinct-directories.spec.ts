import { describe, expect, it } from 'vitest';
import { assertDistinctDirectories } from './assert-distinct-directories';
import { ParallelError } from './parallel-error';
import type { ParallelInstance } from './parallel-instance';

function instance(id: string, dir: string): ParallelInstance<string> {
  return {
    instanceId: id,
    workingDirectory: dir,
    run: (): Promise<string> => Promise.resolve(id),
  };
}

describe('assertDistinctDirectories', () => {
  it('accepts instances in distinct directories', () => {
    expect(() => {
      assertDistinctDirectories([instance('a', '/a'), instance('b', '/b')]);
    }).not.toThrow();
  });

  it('accepts no instances at all', () => {
    expect(() => {
      assertDistinctDirectories([]);
    }).not.toThrow();
  });

  it('refuses instances sharing a directory, naming it', () => {
    expect(() => {
      assertDistinctDirectories([instance('a', '/a'), instance('b', '/a')]);
    }).toThrow(ParallelError);
    expect(() => {
      assertDistinctDirectories([instance('a', '/a'), instance('b', '/a')]);
    }).toThrow(/"\/a"/);
  });
});
