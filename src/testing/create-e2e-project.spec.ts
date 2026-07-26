import { rm, stat } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { createE2eProject } from './create-e2e-project';
import type { E2eProject } from './e2e-project';

describe('createE2eProject', () => {
  it('provisions an empty project directory', async () => {
    const project: E2eProject = await createE2eProject();

    try {
      expect((await stat(project.dir)).isDirectory()).toBe(true);
      expect(await project.readInvocations()).toEqual([]);
    } finally {
      await project.cleanup();
    }
  });

  it('removes everything it provisioned on cleanup', async () => {
    const project: E2eProject = await createE2eProject();
    const dir: string = project.dir;

    await project.cleanup();

    await expect(stat(dir)).rejects.toThrow();
  });

  it('gives each project its own directory', async () => {
    const first: E2eProject = await createE2eProject();
    const second: E2eProject = await createE2eProject();

    try {
      expect(first.dir).not.toBe(second.dir);
    } finally {
      await first.cleanup();
      await second.cleanup();
      await rm(first.logPath, { force: true });
    }
  });
});
