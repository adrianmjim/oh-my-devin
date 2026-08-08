import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deriveProfileSnapshot } from './derive-profile-snapshot';
import type { ProfileSnapshot } from './profile-snapshot';

describe('deriveProfileSnapshot', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-profile-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeManifest(
    manifest: Record<string, unknown>,
  ): Promise<void> {
    await writeFile(
      join(projectDir, 'package.json'),
      JSON.stringify(manifest),
      'utf8',
    );
  }

  it('derives an empty-but-structured snapshot from a bare directory', async () => {
    const snapshot: ProfileSnapshot = await deriveProfileSnapshot(
      projectDir,
      5,
    );

    expect(snapshot).toEqual({
      stack: [],
      layout: [],
      entryCommands: [],
      derivedAt: 5,
    });
  });

  it('reads the stack from the manifests the repository carries', async () => {
    await writeManifest({ name: 'thing' });
    await writeFile(join(projectDir, 'tsconfig.json'), '{}', 'utf8');

    const snapshot: ProfileSnapshot = await deriveProfileSnapshot(
      projectDir,
      5,
    );

    expect(snapshot.stack).toContain('node');
    expect(snapshot.stack).toContain('typescript');
  });

  it('reads the layout from the repository top-level directories', async () => {
    await mkdir(join(projectDir, 'src'), { recursive: true });
    await mkdir(join(projectDir, 'docs'), { recursive: true });
    await writeFile(join(projectDir, 'README.md'), '# thing', 'utf8');

    const snapshot: ProfileSnapshot = await deriveProfileSnapshot(
      projectDir,
      5,
    );

    expect(snapshot.layout).toEqual(['docs', 'src']);
  });

  it('reads the entry commands from the manifest scripts', async () => {
    await writeManifest({
      packageManager: 'pnpm@11.17.0',
      scripts: { build: 'tsc', test: 'vitest run' },
    });

    const snapshot: ProfileSnapshot = await deriveProfileSnapshot(
      projectDir,
      5,
    );

    expect(snapshot.entryCommands).toEqual(['pnpm run build', 'pnpm run test']);
  });

  it('reads no engine or omd state into the snapshot', async () => {
    await mkdir(join(projectDir, '.devin', 'agents', 'reviewer'), {
      recursive: true,
    });
    await mkdir(join(projectDir, '.omd', 'runs'), { recursive: true });
    await mkdir(join(projectDir, 'node_modules', 'yaml'), { recursive: true });
    await mkdir(join(projectDir, 'src'), { recursive: true });

    const snapshot: ProfileSnapshot = await deriveProfileSnapshot(
      projectDir,
      5,
    );

    expect(snapshot.layout).toEqual(['src']);
  });

  it('derives a structured snapshot from an unreadable manifest rather than failing', async () => {
    await writeFile(join(projectDir, 'package.json'), 'not json', 'utf8');

    const snapshot: ProfileSnapshot = await deriveProfileSnapshot(
      projectDir,
      5,
    );

    expect(snapshot.stack).toEqual(['node']);
    expect(snapshot.entryCommands).toEqual([]);
  });

  it('stamps the snapshot with the moment it was derived', async () => {
    expect((await deriveProfileSnapshot(projectDir, 4242)).derivedAt).toBe(
      4242,
    );
  });
});
