import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { ExecutorArtifact } from './executor-artifact';
import { parseExecutorArtifact } from './parse-executor-artifact';

describe('parseExecutorArtifact', () => {
  it('narrows schema-valid evidence to the typed artifact', () => {
    const artifact: ExecutorArtifact = parseExecutorArtifact(
      {
        tests: 'passed',
        commands: [{ command: 'npm test', result: '12 passing' }],
        notes: 'ignored by the bench',
      },
      'evidence.json',
    );

    expect(artifact.tests).toBe('passed');
    expect(artifact.commands[0]?.command).toBe('npm test');
  });

  it('rejects an unknown test claim, naming the source', () => {
    expect(() =>
      parseExecutorArtifact(
        { tests: 'skipped', commands: [] },
        'evidence.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      parseExecutorArtifact(
        { tests: 'skipped', commands: [] },
        'evidence.json',
      ),
    ).toThrow('evidence.json');
  });

  it('rejects a command entry missing its result', () => {
    expect(() =>
      parseExecutorArtifact(
        { tests: 'passed', commands: [{ command: 'npm test' }] },
        'evidence.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
