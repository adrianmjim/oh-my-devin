import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RunReport } from '../outcome/run-report';
import type { RunRoleOptions } from '../run/run-role-options';
import type { BenchFixture } from './bench-fixture';
import type { FixtureScore } from './fixture-score';
import { runBenchCase } from './run-bench-case';

describe('runBenchCase', () => {
  let fixtureDir: string;
  let fixture: BenchFixture;

  beforeEach(async () => {
    fixtureDir = await mkdtemp(join(tmpdir(), 'omd-bench-case-'));
    const treeDir: string = join(fixtureDir, 'tree');
    await mkdir(treeDir, { recursive: true });
    await writeFile(join(treeDir, 'loop.js'), 'while (true) {}\n', 'utf8');
    fixture = {
      id: 'unbounded-loop',
      role: 'reviewer',
      clean: false,
      dir: fixtureDir,
      treeDir,
      task: 'Review the diff.',
      truth: {
        role: 'reviewer',
        expectedVerdict: 'request_changes',
        defects: [
          { id: 'unbounded-loop', keywords: ['unbounded'], severity: 'high' },
        ],
      },
      sampleArtifact: JSON.stringify({
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            location: 'loop.js:1',
            summary: 'the loop is unbounded',
            fix: 'bound it',
          },
        ],
      }),
    };
  });

  afterEach(async () => {
    await rm(fixtureDir, { recursive: true, force: true });
  });

  it('provisions, scores and disposes of the scratch copy on the dry path', async () => {
    let workingDirectory: string | null = null;

    const score: FixtureScore = await runBenchCase(
      fixture,
      'dry',
      'claude-sonnet-5-medium',
      (options: RunRoleOptions): Promise<RunReport> => {
        workingDirectory = options.workingDirectory;
        throw new Error('the dry path must not run a role');
      },
    );

    expect(score.composite).toBe(1);
    expect(workingDirectory).toBeNull();
  });

  it('runs the role inside the scratch copy on the real path', async () => {
    const seen: string[] = [];

    const score: FixtureScore = await runBenchCase(
      fixture,
      'real',
      'claude-sonnet-5-medium',
      async (options: RunRoleOptions): Promise<RunReport> => {
        seen.push(options.workingDirectory);
        await writeFile(
          join(options.workingDirectory, 'review.json'),
          fixture.sampleArtifact,
          'utf8',
        );
        return {
          runId: 'run-1',
          role: 'reviewer',
          task: options.task,
          engine: 'devin',
          sessionId: 's1',
          failureTier: null,
          turnsUsed: 1,
          maxTurns: 6,
          wallTimeMs: 1,
          artifactPath: 'review.json',
          writeScope: 'artifact',
          artifactValid: true,
          validationErrors: [],
          denyRule: null,
          repairAttempted: false,
        };
      },
    );

    expect(seen).toHaveLength(1);
    expect(seen[0]).not.toBe(fixture.treeDir);
    expect(score.composite).toBe(1);
    await expect(stat(seen[0] ?? '')).rejects.toThrow();
  });

  it('disposes of the scratch copy even when the run throws', async () => {
    await expect(
      runBenchCase(
        fixture,
        'real',
        'claude-sonnet-5-medium',
        (): Promise<RunReport> => {
          throw new Error('engine exploded');
        },
      ),
    ).rejects.toThrow('engine exploded');
  });
});
