import { mkdir, mkdtemp, rm, stat, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { withModeStateLock } from './with-mode-state-lock';

describe('withModeStateLock', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-mode-lock-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  function lockDir(): string {
    return join(projectDir, '.omd', 'modes.lock');
  }

  async function lockExists(): Promise<boolean> {
    try {
      await stat(lockDir());
      return true;
    } catch {
      return false;
    }
  }

  it('runs the action and hands back its result', async () => {
    expect(
      await withModeStateLock(projectDir, (): Promise<string> => {
        return Promise.resolve('done');
      }),
    ).toBe('done');
  });

  it('releases the lock once the action finished', async () => {
    await withModeStateLock(projectDir, (): Promise<null> => {
      return Promise.resolve(null);
    });

    expect(await lockExists()).toBe(false);
  });

  it('releases the lock when the action throws', async () => {
    await expect(
      withModeStateLock(projectDir, (): Promise<never> => {
        return Promise.reject(new Error('boom'));
      }),
    ).rejects.toThrow('boom');

    expect(await lockExists()).toBe(false);
  });

  it('serializes overlapping critical sections', async () => {
    const marks: string[] = [];
    async function enter(tag: string, holdMs: number): Promise<void> {
      await withModeStateLock(projectDir, async (): Promise<void> => {
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
    await mkdir(lockDir(), { recursive: true });
    const abandonedAt: number = (Date.now() - 60000) / 1000;
    await utimes(lockDir(), abandonedAt, abandonedAt);

    expect(
      await withModeStateLock(projectDir, (): Promise<string> => {
        return Promise.resolve('ran');
      }),
    ).toBe('ran');
  });

  it('proceeds without the lock rather than block on a live holder', async () => {
    await mkdir(lockDir(), { recursive: true });

    expect(
      await withModeStateLock(projectDir, (): Promise<string> => {
        return Promise.resolve('ran');
      }),
    ).toBe('ran');
    expect(await lockExists()).toBe(true);
  });
});
