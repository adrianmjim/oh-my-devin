import { cp, mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { setupLayer } from '../setup/setup-layer';
import type { BenchFixture } from './bench-fixture';
import { BENCH_SCRATCH_DIR } from './bench-scratch-dir';
import type { ScratchProject } from './scratch-project';

export async function provisionScratchProject(
  fixture: BenchFixture,
): Promise<ScratchProject> {
  await mkdir(BENCH_SCRATCH_DIR, { recursive: true });
  const dir: string = await realpath(
    await mkdtemp(join(BENCH_SCRATCH_DIR, `${fixture.role}-`)),
  );
  await setupLayer(dir);
  await cp(fixture.treeDir, dir, { recursive: true });
  return {
    dir,
    cleanup: async (): Promise<void> => {
      await rm(dir, { recursive: true, force: true });
    },
  };
}
