import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BenchFixture } from './bench-fixture';
import { BenchFixtureError } from './bench-fixture-error';
import { enumerateFixtures } from './enumerate-fixtures';
import type { ReviewerTruthDocument } from './reviewer-truth-document';
import type { RoleFixtureSet } from './role-fixture-set';

const HYPOTHESIS: string =
  'The reviewer prompt makes severity track impact rather than effort.';

describe('enumerateFixtures', () => {
  let fixturesDir: string;

  async function writeFixture(
    id: string,
    pieces: { manifest?: boolean; truth?: boolean; task?: boolean; sample?: boolean; tree?: boolean },
  ): Promise<void> {
    const dir: string = join(fixturesDir, 'reviewer', id);
    await mkdir(dir, { recursive: true });
    if (pieces.tree !== false) {
      await mkdir(join(dir, 'tree'), { recursive: true });
      await writeFile(join(dir, 'tree', 'loop.js'), 'while (true) {}\n', 'utf8');
    }
    if (pieces.truth !== false) {
      await writeFile(
        join(dir, 'truth.json'),
        JSON.stringify({
          role: 'reviewer',
          expectedVerdict: 'request_changes',
          defects: [
            { id: 'unbounded-loop', keywords: ['unbounded'], severity: 'high' },
          ],
        }),
        'utf8',
      );
    }
    if (pieces.task !== false) {
      await writeFile(join(dir, 'task.md'), 'Review the diff.\n', 'utf8');
    }
    if (pieces.sample !== false) {
      await writeFile(
        join(dir, 'sample.json'),
        JSON.stringify({ verdict: 'request_changes', findings: [] }),
        'utf8',
      );
    }
  }

  async function writeManifest(clean: boolean = false): Promise<void> {
    await mkdir(join(fixturesDir, 'reviewer'), { recursive: true });
    await writeFile(
      join(fixturesDir, 'reviewer', 'manifest.json'),
      JSON.stringify({
        role: 'reviewer',
        hypothesis: HYPOTHESIS,
        fixtures: [{ id: 'unbounded-loop', clean }],
      }),
      'utf8',
    );
  }

  beforeEach(async () => {
    fixturesDir = await mkdtemp(join(tmpdir(), 'omd-bench-fixtures-'));
  });

  afterEach(async () => {
    await rm(fixturesDir, { recursive: true, force: true });
  });

  it('loads every fixture the manifest names with all of its pieces', async () => {
    await writeManifest();
    await writeFixture('unbounded-loop', {});

    const set: RoleFixtureSet = await enumerateFixtures('reviewer', fixturesDir);

    expect(set.role).toBe('reviewer');
    expect(set.hypothesis).toBe(HYPOTHESIS);
    expect(set.fixtures).toHaveLength(1);
    const fixture: BenchFixture | undefined = set.fixtures[0];
    expect(fixture?.id).toBe('unbounded-loop');
    expect(fixture?.clean).toBe(false);
    expect(fixture?.task).toBe('Review the diff.');
    expect(fixture?.treeDir).toBe(
      join(fixturesDir, 'reviewer', 'unbounded-loop', 'tree'),
    );
    expect((fixture?.truth as ReviewerTruthDocument).expectedVerdict).toBe(
      'request_changes',
    );
    expect(fixture?.sampleArtifact).toContain('request_changes');
  });

  it('carries the manifest clean flag onto the fixture', async () => {
    await writeManifest(true);
    await writeFixture('unbounded-loop', {});

    const set: RoleFixtureSet = await enumerateFixtures('reviewer', fixturesDir);

    expect(set.fixtures[0]?.clean).toBe(true);
  });

  it('surfaces a named error when the manifest is missing', async () => {
    await expect(enumerateFixtures('reviewer', fixturesDir)).rejects.toThrow(
      BenchFixtureError,
    );
    await expect(enumerateFixtures('reviewer', fixturesDir)).rejects.toThrow(
      /manifest\.json/,
    );
  });

  it('surfaces a named error when a truth document is missing', async () => {
    await writeManifest();
    await writeFixture('unbounded-loop', { truth: false });

    await expect(enumerateFixtures('reviewer', fixturesDir)).rejects.toThrow(
      /truth\.json/,
    );
  });

  it('surfaces a named error when the task prompt is missing', async () => {
    await writeManifest();
    await writeFixture('unbounded-loop', { task: false });

    await expect(enumerateFixtures('reviewer', fixturesDir)).rejects.toThrow(
      /task\.md/,
    );
  });

  it('surfaces a named error when the recorded sample artifact is missing', async () => {
    await writeManifest();
    await writeFixture('unbounded-loop', { sample: false });

    await expect(enumerateFixtures('reviewer', fixturesDir)).rejects.toThrow(
      /sample\.json/,
    );
  });

  it('surfaces a named error when the input tree is missing', async () => {
    await writeManifest();
    await writeFixture('unbounded-loop', { tree: false });

    await expect(enumerateFixtures('reviewer', fixturesDir)).rejects.toThrow(
      /tree/,
    );
  });

  it('rejects a truth document written for another role', async () => {
    await writeManifest();
    await writeFixture('unbounded-loop', {});
    await writeFile(
      join(fixturesDir, 'reviewer', 'unbounded-loop', 'truth.json'),
      JSON.stringify({ role: 'architect', gaps: [] }),
      'utf8',
    );

    await expect(enumerateFixtures('reviewer', fixturesDir)).rejects.toThrow(
      BenchFixtureError,
    );
  });

  it('rejects a manifest declaring another role', async () => {
    await mkdir(join(fixturesDir, 'architect'), { recursive: true });
    await writeFile(
      join(fixturesDir, 'architect', 'manifest.json'),
      JSON.stringify({
        role: 'reviewer',
        hypothesis: HYPOTHESIS,
        fixtures: [{ id: 'x', clean: false }],
      }),
      'utf8',
    );

    await expect(enumerateFixtures('architect', fixturesDir)).rejects.toThrow(
      BenchFixtureError,
    );
  });
});
