import { stat } from 'node:fs/promises';
import type { Stats } from 'node:fs';
import { join } from 'node:path';
import type { BenchFixture } from './bench-fixture';
import { BenchFixtureError } from './bench-fixture-error';
import type { BenchRole } from './bench-role';
import type { FixtureManifestEntry } from './fixture-manifest-entry';
import { parseBenchJson } from './parse-bench-json';
import { readBenchFile } from './read-bench-file';
import type { TruthDocument } from './truth-document';
import { validateTruthDocument } from './validate-truth-document';

export async function loadFixture(
  role: BenchRole,
  roleDir: string,
  entry: FixtureManifestEntry,
): Promise<BenchFixture> {
  const dir: string = join(roleDir, entry.id);
  const treeDir: string = join(dir, 'tree');
  let tree: Stats | null;
  try {
    tree = await stat(treeDir);
  } catch {
    tree = null;
  }
  if (tree?.isDirectory() !== true) {
    throw new BenchFixtureError(`"${treeDir}" is missing or not a directory`);
  }

  const truthPath: string = join(dir, 'truth.json');
  const truth: TruthDocument = validateTruthDocument(
    parseBenchJson(await readBenchFile(truthPath), truthPath),
    truthPath,
  );
  if (truth.role !== role) {
    throw new BenchFixtureError(
      `"${truthPath}" declares role "${truth.role}" under the "${role}" fixture set`,
    );
  }

  return {
    id: entry.id,
    role,
    clean: entry.clean,
    dir,
    treeDir,
    task: (await readBenchFile(join(dir, 'task.md'))).trim(),
    truth,
    sampleArtifact: await readBenchFile(join(dir, 'sample.json')),
  };
}
