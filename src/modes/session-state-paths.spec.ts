import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { modeStateRoot } from './mode-state-root';
import { SessionStatePaths } from './session-state-paths';

describe('SessionStatePaths', () => {
  it('partitions a session under the mode-state root', () => {
    const paths: SessionStatePaths = new SessionStatePaths(
      '/project',
      'sess-1',
    );

    expect(paths.dir).toBe(join(modeStateRoot('/project'), 'sess-1'));
  });

  it('names the registry and slot files inside that partition', () => {
    const paths: SessionStatePaths = new SessionStatePaths(
      '/project',
      'sess-1',
    );

    expect(paths.seen).toBe(join(paths.dir, 'seen.json'));
    expect(paths.slots).toBe(join(paths.dir, 'slots.json'));
    expect(paths.staged).toBe(join(paths.dir, 'staged.json'));
    expect(paths.stops).toBe(join(paths.dir, 'stops.json'));
  });

  it('keeps two sessions in disjoint partitions', () => {
    const one: SessionStatePaths = new SessionStatePaths('/project', 'sess-1');
    const other: SessionStatePaths = new SessionStatePaths(
      '/project',
      'sess-2',
    );

    expect(one.dir).not.toBe(other.dir);
  });
});
