import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { withDetectionStateLock } from './with-detection-state-lock';

describe('withDetectionStateLock', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-detection-lock-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('holds the detection lock of the project while the action runs', async () => {
    const held: boolean = await withDetectionStateLock(
      projectDir,
      async (): Promise<boolean> => {
        return (
          await stat(join(projectDir, '.omd', 'detection.lock'))
        ).isDirectory();
      },
    );

    expect(held).toBe(true);
  });

  it('releases the lock and hands back the result', async () => {
    expect(
      await withDetectionStateLock(projectDir, (): Promise<string> => {
        return Promise.resolve('done');
      }),
    ).toBe('done');
    await expect(
      stat(join(projectDir, '.omd', 'detection.lock')),
    ).rejects.toThrow();
  });

  it('serializes overlapping critical sections', async () => {
    const marks: string[] = [];
    async function enter(tag: string, holdMs: number): Promise<void> {
      await withDetectionStateLock(projectDir, async (): Promise<void> => {
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
});
