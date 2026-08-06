import { describe, expect, it } from 'vitest';
import { ALL_BENCH_ROLES } from './all-bench-roles';
import { BENCH_FIXTURES_DIR } from './bench-fixtures-dir';
import { BenchFixtureError } from './bench-fixture-error';
import type { BenchFixture } from './bench-fixture';
import type { BenchRole } from './bench-role';
import { enumerateFixtures } from './enumerate-fixtures';
import { parseArchitectArtifact } from './parse-architect-artifact';
import { parseBenchJson } from './parse-bench-json';
import { parseExecutorArtifact } from './parse-executor-artifact';
import { parseReviewerArtifact } from './parse-reviewer-artifact';
import type { RoleFixtureSet } from './role-fixture-set';
import { validateFixtureManifest } from './validate-fixture-manifest';
import { validateTruthDocument } from './validate-truth-document';

const SETS: readonly RoleFixtureSet[] = await Promise.all(
  ALL_BENCH_ROLES.map(
    (role: BenchRole): Promise<RoleFixtureSet> =>
      enumerateFixtures(role, BENCH_FIXTURES_DIR),
  ),
);

function parseArtifact(fixture: BenchFixture): void {
  const source: string = `${fixture.role}/${fixture.id}/sample.json`;
  const parsed: unknown = parseBenchJson(fixture.sampleArtifact, source);
  if (fixture.role === 'reviewer') {
    parseReviewerArtifact(parsed, source);
  } else if (fixture.role === 'architect') {
    parseArchitectArtifact(parsed, source);
  } else {
    parseExecutorArtifact(parsed, source);
  }
}

describe('committed bench fixtures', () => {
  it('loads every role fixture set with its manifest and hypothesis', () => {
    for (const set of SETS) {
      expect(set.fixtures.length, `${set.role} has no fixtures`).toBeGreaterThan(
        0,
      );
      expect(set.hypothesis.trim()).not.toBe('');
    }
  });

  it('validates every committed truth document against its typed shape', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        expect(fixture.truth.role, `${set.role}/${fixture.id}`).toBe(set.role);
      }
    }
  });

  it('records a sample artifact each role scorer can read', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        expect(() => {
          parseArtifact(fixture);
        }, `${set.role}/${fixture.id}`).not.toThrow();
      }
    }
  });

  it('keeps every clean fixture free of embedded defects', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        const truth = fixture.truth;
        if (fixture.clean && truth.role === 'reviewer') {
          expect(truth.defects, `${set.role}/${fixture.id}`).toEqual([]);
          expect(truth.expectedVerdict).toBe('approve');
        }
        if (fixture.clean && truth.role === 'architect') {
          expect(truth.spurious, `${set.role}/${fixture.id}`).toEqual([]);
        }
      }
    }
  });

  it('gives every flawed reviewer fixture at least one defect to find', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        const truth = fixture.truth;
        if (!fixture.clean && truth.role === 'reviewer') {
          expect(
            truth.defects.length,
            `${set.role}/${fixture.id}`,
          ).toBeGreaterThan(0);
          expect(truth.expectedVerdict).toBe('request_changes');
        }
      }
    }
  });

  it('keeps the reviewer fixture set measuring false-positive resistance', () => {
    const reviewer: RoleFixtureSet | undefined = SETS.find(
      (set: RoleFixtureSet): boolean => set.role === 'reviewer',
    );

    expect(
      reviewer?.fixtures.some((fixture: BenchFixture): boolean => fixture.clean),
    ).toBe(true);
  });

  it('rejects a malformed truth document', () => {
    expect(() =>
      validateTruthDocument(
        { role: 'reviewer', expectedVerdict: 'approve' },
        'malformed/truth.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      validateTruthDocument(
        {
          role: 'architect',
          gaps: [{ id: 'no-keywords', keywords: [] }],
        },
        'malformed/truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a manifest whose hypothesis is empty', () => {
    expect(() =>
      validateFixtureManifest(
        {
          role: 'reviewer',
          hypothesis: '  ',
          fixtures: [{ id: 'a', clean: false }],
        },
        'malformed/manifest.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
