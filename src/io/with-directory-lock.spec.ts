import { mkdir, mkdtemp, rm, stat, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DirectoryLock } from './directory-lock';
import { withDirectoryLock } from './with-directory-lock';

describe('withDirectoryLock', () => {
  let root: string;
  let lock: DirectoryLock;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'omd-directory-lock-'));
    lock = {
      dir: join(root, 'state', 'held.lock'),
      staleMs: 5000,
      waitMs: 200,
    };
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  async function lockExists(): Promise<boolean> {
    try {
      await stat(lock.dir);
      return true;
    } catch {
      return false;
    }
  }

  it('runs the action and hands back its result', async () => {
    expect(
      await withDirectoryLock(lock, (): Promise<string> => {
        return Promise.resolve('done');
      }),
    ).toBe('done');
  });

  it('creates the lock parent on first use', async () => {
    await withDirectoryLock(lock, (): Promise<null> => {
      return Promise.resolve(null);
    });

    expect((await stat(join(root, 'state'))).isDirectory()).toBe(true);
  });

  it('releases the lock once the action finished', async () => {
    await withDirectoryLock(lock, (): Promise<null> => {
      return Promise.resolve(null);
    });

    expect(await lockExists()).toBe(false);
  });

  it('releases the lock when the action throws', async () => {
    await expect(
      withDirectoryLock(lock, (): Promise<never> => {
        return Promise.reject(new Error('boom'));
      }),
    ).rejects.toThrow('boom');

    expect(await lockExists()).toBe(false);
  });

  it('serializes overlapping critical sections', async () => {
    const marks: string[] = [];
    async function enter(tag: string, holdMs: number): Promise<void> {
      await withDirectoryLock(lock, async (): Promise<void> => {
        marks.push(`${tag}-in`);
        await new Promise<void>((resolve: () => void): void => {
          setTimeout(resolve, holdMs);
        });
        marks.push(`${tag}-out`);
      });
    }

    await Promise.all([enter('a', 60), enter('b', 0)]);

    expect(marks).toHaveLength(4);
    expect(marks[1]).toBe(`${marks[0]?.charAt(0)}-out`);
    expect(marks[3]).toBe(`${marks[2]?.charAt(0)}-out`);
  });

  it('takes over a lock left behind by a dead process', async () => {
    await mkdir(lock.dir, { recursive: true });
    const abandonedAt: number = (Date.now() - 60000) / 1000;
    await utimes(lock.dir, abandonedAt, abandonedAt);

    expect(
      await withDirectoryLock(lock, (): Promise<string> => {
        return Promise.resolve('ran');
      }),
    ).toBe('ran');
  });

  it('proceeds without the lock rather than block on a live holder', async () => {
    await mkdir(lock.dir, { recursive: true });

    expect(
      await withDirectoryLock(lock, (): Promise<string> => {
        return Promise.resolve('ran');
      }),
    ).toBe('ran');
    expect(await lockExists()).toBe(true);
  });
});
