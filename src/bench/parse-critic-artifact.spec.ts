import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import type { CriticArtifact } from './critic-artifact';
import { parseCriticArtifact } from './parse-critic-artifact';

describe('parseCriticArtifact', () => {
  it('reads a located present flaw', () => {
    const artifact: CriticArtifact = parseCriticArtifact(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            category: 'present_flaw',
            location: 'plan.md:4',
            summary: 'The backfill runs after the cutover',
            fix: 'Move it earlier',
          },
        ],
      },
      'sample.json',
    );

    expect(artifact.verdict).toBe('request_changes');
    expect(artifact.findings[0]?.where).toBe('plan.md:4');
  });

  it('reads a named missing element as its own locator', () => {
    const artifact: CriticArtifact = parseCriticArtifact(
      {
        verdict: 'request_changes',
        findings: [
          {
            severity: 'high',
            category: 'missing_element',
            absentElement: 'rollback step',
            summary: 'Nothing undoes the cutover',
            fix: 'Add one',
          },
        ],
      },
      'sample.json',
    );

    expect(artifact.findings[0]?.where).toBe('rollback step');
  });

  it('reads an approving critique with nothing to report', () => {
    expect(
      parseCriticArtifact({ verdict: 'approve', findings: [] }, 'sample.json')
        .findings,
    ).toEqual([]);
  });

  it('rejects a verdict the layer cannot route on', () => {
    expect(() =>
      parseCriticArtifact({ verdict: 'lgtm', findings: [] }, 'sample.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects findings that are not a list', () => {
    expect(() =>
      parseCriticArtifact({ verdict: 'approve', findings: 3 }, 'sample.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a finding locating itself nowhere', () => {
    expect(() =>
      parseCriticArtifact(
        {
          verdict: 'request_changes',
          findings: [
            {
              severity: 'high',
              category: 'present_flaw',
              summary: 'Something is wrong',
              fix: 'Fix it',
            },
          ],
        },
        'sample.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a category the critique does not know', () => {
    expect(() =>
      parseCriticArtifact(
        {
          verdict: 'request_changes',
          findings: [
            {
              severity: 'high',
              category: 'other',
              location: 'plan.md:1',
              summary: 's',
              fix: 'f',
            },
          ],
        },
        'sample.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
