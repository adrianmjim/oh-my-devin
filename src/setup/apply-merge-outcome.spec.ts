import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyMergeOutcome } from './apply-merge-outcome';
import type { MergeTarget } from './merge-target';
import type { TargetReport } from './target-report';

describe('applyMergeOutcome', () => {
  let directory: string;
  let target: MergeTarget;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-apply-outcome-'));
    target = {
      kind: 'merge',
      component: 'rules',
      absolutePath: join(directory, 'nested', 'rules.md'),
      reportPath: 'rules.md',
      strategy: 'unit',
      framing: {
        id: 'rules',
        version: '1.2.3',
        style: 'markdown',
        content: 'body',
      },
    };
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('writes the content of a created outcome, making its directory', async () => {
    const report: TargetReport = await applyMergeOutcome(target, {
      kind: 'created',
      content: 'written',
    });

    expect(await readFile(target.absolutePath, 'utf8')).toBe('written');
    expect(report.outcome).toBe('created');
    expect(report.path).toBe('rules.md');
    expect(report.reason).toBeNull();
  });

  it('writes the content of an updated outcome', async () => {
    await applyMergeOutcome(target, { kind: 'created', content: 'first' });
    await applyMergeOutcome(target, { kind: 'updated', content: 'second' });

    expect(await readFile(target.absolutePath, 'utf8')).toBe('second');
  });

  it('writes nothing for an outcome that carries no content', async () => {
    const report: TargetReport = await applyMergeOutcome(target, {
      kind: 'blocked',
      reason: 'unreadable',
    });

    await expect(readFile(target.absolutePath, 'utf8')).rejects.toThrow();
    expect(report.reason).toBe('unreadable');
  });
});
